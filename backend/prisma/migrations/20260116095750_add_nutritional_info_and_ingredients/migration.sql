-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "allergens" TEXT[],
ADD COLUMN     "ingredients" TEXT[],
ADD COLUMN     "nutritionalInfo" JSONB;

-- CreateIndex
CREATE INDEX "MenuItem_restaurantId_orderCount_idx" ON "MenuItem"("restaurantId", "orderCount");
