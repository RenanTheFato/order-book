import { AssetStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/client";

export interface Asset {
  id: string,
  ticker: string,
  name: string,
  status: AssetStatus,
  total_supply: Decimal,
  last_price: Decimal,
  last_price_at?: Date | null,
  created_at: Date,
  updated_at: Date
}