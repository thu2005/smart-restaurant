/*
  Warnings:

  - The `modifiers` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "modifiers",
ADD COLUMN     "modifiers" TEXT[];
