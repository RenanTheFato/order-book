import { Decimal } from "@prisma/client/runtime/client";

export interface Position {
  id: string,
  user_id: string,
  asset_id: string,
  quantity: Decimal,
  quantity_locked: Decimal,
  avg_price: Decimal,
  created_at: Date,
  updated_at: Date
}