import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma.js";
import { Order } from "../../interfaces/order.js";
import { publishTrade } from "../publishers/trade-publisher.js";
import { publishOrderBookUpdate } from "../publishers/order-book-publisher.js";
import { publishBalanceUpdate, publishOrderUpdate, publishPositionUpdate } from "../../websocket/publishers/user-publisher.js";

export class MatchingEngine {
  async match(order: Order, reservedPrice: Decimal): Promise<void> {
    let quantityFilled = new Decimal(0)

    let totalSpent = new Decimal(0)

    while (true) {
      const remaining = order.quantity.sub(quantityFilled)
      if (remaining.lte(0)) break

      const makerOrder = await this.findBestMaker(order, quantityFilled)
      if (!makerOrder) break

      const makerRemaining = makerOrder.quantity.sub(makerOrder.quantity_filled)
      const fillQuantity = Decimal.min(remaining, makerRemaining)
      const tradePrice = makerOrder.price!

      const { trade, buyerPosition, sellerBalance, takerBalance, buyerBalance } =
        await this.executeTrade({
          takerOrder: { ...order, quantity_filled: quantityFilled },
          makerOrder,
          fillQuantity,
          tradePrice,
        })

      quantityFilled = quantityFilled.add(fillQuantity)
      totalSpent = totalSpent.add(tradePrice.mul(fillQuantity))

      publishTrade(trade)

      await publishOrderBookUpdate(order.asset_id, [
        { price: tradePrice, side: makerOrder.side },
      ])

      const takerNewFilled = quantityFilled
      const takerStatus = takerNewFilled.gte(order.quantity) ? "FILLED" : ""

      publishOrderUpdate(order.user_id, {
        id: order.id,
        status: takerStatus,
        quantity_filled: takerNewFilled,
      })

      const makerNewFilled = makerOrder.quantity_filled.add(fillQuantity)
      const makerStatus = makerNewFilled.gte(makerOrder.quantity) ? "FILLED" : "PARTIALLY_FILLED"

      publishOrderUpdate(makerOrder.user_id, {
        id: makerOrder.id,
        status: makerStatus,
        quantity_filled: makerNewFilled,
      })

      const buyUserId = order.side === "BUY" ? order.user_id : makerOrder.user_id
      const sellUserId = order.side === "SELL" ? order.user_id : makerOrder.user_id

      publishPositionUpdate(buyUserId, buyerPosition)
      publishBalanceUpdate(sellUserId, sellerBalance)

      if (order.side === "BUY" && takerBalance) {
        publishBalanceUpdate(order.user_id, takerBalance)
      }
    }

    if (order.type === "LIMIT" && order.price && quantityFilled.lt(order.quantity)) {
      await publishOrderBookUpdate(order.asset_id, [
        { price: order.price, side: order.side },
      ])
    }

    if (order.type === "MARKET" && quantityFilled.lt(order.quantity)) {
      const remaining = order.quantity.sub(quantityFilled)
      await this.cancelMarketRemainder(order, remaining, reservedPrice, totalSpent)
    }
  }


  private async findBestMaker(takerOrder: Order, currentFilled: Decimal) {
    const oppositeSide = takerOrder.side === "BUY" ? "SELL" : "BUY"

    const priceFilter =
      takerOrder.type === "LIMIT" && takerOrder.price
        ? takerOrder.side === "BUY"
          ? { lte: takerOrder.price }
          : { gte: takerOrder.price }
        : undefined

    return prisma.orders.findFirst({
      where: {
        asset_id: takerOrder.asset_id,
        side: oppositeSide,
        status: { in: ["OPEN", "PARTIALLY_FILLED"] },
        type: "LIMIT",
        NOT: { user_id: takerOrder.user_id },
        ...(priceFilter ? { price: priceFilter } : {}),
      },
      orderBy: [
        { price: takerOrder.side === "BUY" ? "asc" : "desc" },
        { created_at: "asc" },
      ],
    })
  }

  private async executeTrade({ takerOrder, makerOrder, fillQuantity, tradePrice }: { takerOrder: Order, makerOrder: Order, fillQuantity: Decimal, tradePrice: Decimal }) {

    const buyOrder = takerOrder.side === "BUY" ? takerOrder : makerOrder
    const sellOrder = takerOrder.side === "SELL" ? takerOrder : makerOrder

    return prisma.$transaction(async (tx) => {
      const trade = await tx.trades.create({
        data: {
          asset_id: takerOrder.asset_id,
          maker_order_id: makerOrder.id,
          taker_order_id: takerOrder.id,
          price: tradePrice,
          quantity: fillQuantity,
        },
      })
      const takerNewFilled = takerOrder.quantity_filled.add(fillQuantity)
      await tx.orders.update({
        where: { id: takerOrder.id },
        data: {
          quantity_filled: takerNewFilled,
          status: takerNewFilled.gte(takerOrder.quantity) ? "FILLED" : "PARTIALLY_FILLED",
        },
      })

      const makerNewFilled = makerOrder.quantity_filled.add(fillQuantity)
      await tx.orders.update({
        where: { id: makerOrder.id },
        data: {
          quantity_filled: makerNewFilled,
          status: makerNewFilled.gte(makerOrder.quantity) ? "FILLED" : "PARTIALLY_FILLED",
        },
      })

      await tx.assets.update({
        where: { id: takerOrder.asset_id },
        data: { last_price: tradePrice, last_price_at: new Date() },
      })

      const existingPosition = await tx.userPositions.findUnique({
        where: { user_id_asset_id: { user_id: buyOrder.user_id, asset_id: takerOrder.asset_id } },
      })

      let buyerPosition
      if (existingPosition) {
        const newQuantity = existingPosition.quantity.add(fillQuantity)
        const newAvgPrice = existingPosition.quantity
          .mul(existingPosition.avg_price)
          .add(fillQuantity.mul(tradePrice))
          .div(newQuantity)

        buyerPosition = await tx.userPositions.update({
          where: { user_id_asset_id: { user_id: buyOrder.user_id, asset_id: takerOrder.asset_id } },
          data: { quantity: newQuantity, avg_price: newAvgPrice },
        })
      } else {
        buyerPosition = await tx.userPositions.create({
          data: {
            user_id: buyOrder.user_id,
            asset_id: takerOrder.asset_id,
            quantity: fillQuantity,
            quantity_locked: new Decimal(0),
            avg_price: tradePrice,
          },
        })
      }

      let takerBalance: Decimal | null = null
      if (buyOrder.type === "LIMIT" && buyOrder.price!.gt(tradePrice)) {
        const refund = buyOrder.price!.sub(tradePrice).mul(fillQuantity)
        const updatedBuyer = await tx.users.update({
          where: { id: buyOrder.user_id },
          data: { balance: { increment: refund } },
          select: { balance: true },
        })
        if (takerOrder.side === "BUY") takerBalance = updatedBuyer.balance
      }

      const saleProceeds = tradePrice.mul(fillQuantity)
      const updatedSeller = await tx.users.update({
        where: { id: sellOrder.user_id },
        data: { balance: { increment: saleProceeds } },
        select: { balance: true },
      })

      await tx.userPositions.update({
        where: { user_id_asset_id: { user_id: sellOrder.user_id, asset_id: takerOrder.asset_id } },
        data: {
          quantity: { decrement: fillQuantity },
          quantity_locked: { decrement: fillQuantity },
        },
      })

      return {
        trade,
        buyerPosition: {
          asset_id: takerOrder.asset_id,
          quantity: buyerPosition.quantity,
          avg_price: buyerPosition.avg_price,
        },
        sellerBalance: updatedSeller.balance,
        buyerBalance: existingPosition ? undefined : undefined,
        takerBalance,
      }
    })
  }


  private async cancelMarketRemainder(order: Order, remaining: Decimal, reservedPrice: Decimal, totalSpent: Decimal): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      })

      if (order.side === "BUY") {
        const totalReserved = reservedPrice.mul(order.quantity)
        const refund = totalReserved.sub(totalSpent)
        if (refund.gt(0)) {
          await tx.users.update({
            where: { id: order.user_id },
            data: { balance: { increment: refund } },
          })
        }
      }

      if (order.side === "SELL") {
        await tx.userPositions.update({
          where: { user_id_asset_id: { user_id: order.user_id, asset_id: order.asset_id } },
          data: { quantity_locked: { decrement: remaining } },
        })
      }
    })

    publishOrderUpdate(order.user_id, {
      id: order.id,
      status: "CANCELLED",
      quantity_filled: order.quantity.sub(remaining),
    })
  }
}