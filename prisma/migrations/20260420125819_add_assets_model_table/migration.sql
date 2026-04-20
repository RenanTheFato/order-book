-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'OUT');

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "total_supply" DECIMAL(18,8) NOT NULL,
    "last_price" DECIMAL(18,8) NOT NULL,
    "last_price_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_ticker_key" ON "assets"("ticker");

-- CreateIndex
CREATE INDEX "assets_id_ticker_idx" ON "assets"("id", "ticker");
