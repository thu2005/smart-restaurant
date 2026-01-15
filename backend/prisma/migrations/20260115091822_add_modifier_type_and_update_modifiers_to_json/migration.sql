/*
  Warnings:

  - The `modifiers` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ModifierGroup" ADD COLUMN     "modifierType" TEXT NOT NULL DEFAULT 'choice';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "modifiers",
ADD COLUMN     "modifiers" JSONB NOT NULL DEFAULT '[]';
