-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'SUCCESS', 'CANCELLED');

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "requested_by_user" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deposits_id_status_idx" ON "deposits"("id", "status");

-- CreateIndex
CREATE INDEX "users_id_balance_idx" ON "users"("id", "balance");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_requested_by_user_fkey" FOREIGN KEY ("requested_by_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
