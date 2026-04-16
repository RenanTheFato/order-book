import { Decimal } from "@prisma/client/runtime/client";
import { DepositStatus } from "../../generated/prisma/enums.js";

export interface Deposit{
  id: string,
  amount: Decimal,
  status: DepositStatus,
  requested_by_user: string,
  created_at: Date,
  updated_at: Date
}