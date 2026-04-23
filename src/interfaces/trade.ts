import { Decimal } from "@prisma/client/runtime/client";

export interface Trade {
  id: string,
  asset_id: string,
  maker_order_id: string,
  taker_order_id: string,
  price: Decimal | null | undefined,
  quantity: Decimal,
  executed_at: Date,
}