/*
  Warnings:

  - Added the required column `metric` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `actionType` on the `ProductHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Metric" AS ENUM ('KG', 'PIECE', 'DOZEN');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('SALE', 'RESTOCK');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "metric" "Metric" NOT NULL;

-- AlterTable
ALTER TABLE "ProductHistory" DROP COLUMN "actionType",
ADD COLUMN     "actionType" "ActionType" NOT NULL;
