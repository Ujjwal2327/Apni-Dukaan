/*
  Warnings:

  - You are about to drop the `ProductHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductHistory" DROP CONSTRAINT "ProductHistory_productId_fkey";

-- DropTable
DROP TABLE "ProductHistory";

-- DropEnum
DROP TYPE "ActionType";

-- CreateTable
CREATE TABLE "DailySales" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "soldCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailySales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailySales_productId_date_key" ON "DailySales"("productId", "date");

-- AddForeignKey
ALTER TABLE "DailySales" ADD CONSTRAINT "DailySales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
