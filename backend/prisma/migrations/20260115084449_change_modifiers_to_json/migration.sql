-- AlterTable: Change modifiers from String[] to Json
-- Step 1: Add new column
ALTER TABLE "OrderItem" ADD COLUMN "modifiers_new" JSONB DEFAULT '[]'::jsonb;

-- Step 2: Migrate existing data (convert String[] to Json array of objects)
UPDATE "OrderItem"
SET "modifiers_new" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', modifier_id,
      'name', modifier_id,
      'quantity', 1,
      'priceAdjustment', 0
    )
  )
  FROM unnest("modifiers") AS modifier_id
)
WHERE array_length("modifiers", 1) > 0;

-- Step 3: Drop old column
ALTER TABLE "OrderItem" DROP COLUMN "modifiers";

-- Step 4: Rename new column
ALTER TABLE "OrderItem" RENAME COLUMN "modifiers_new" TO "modifiers";

-- Step 5: Set NOT NULL constraint
ALTER TABLE "OrderItem" ALTER COLUMN "modifiers" SET NOT NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "modifiers" SET DEFAULT '[]'::jsonb;