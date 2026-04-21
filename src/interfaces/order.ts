import { OrderSide, OrderStatus, OrderType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

export interface Order {
  id: string,
  user_id: string,
  asset_id: string,
  side: OrderSide,
  type: OrderType,
  status: OrderStatus,
  price: Decimal | null | undefined,
  quantity: Decimal,
  quantity_filled: Decimal,
  created_at: Date,
  updated_at: Date
}