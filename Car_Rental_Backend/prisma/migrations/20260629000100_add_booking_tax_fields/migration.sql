ALTER TABLE "Booking"
ADD COLUMN "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "taxRate" DECIMAL(5,4) NOT NULL DEFAULT 0,
ADD COLUMN "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;

UPDATE "Booking"
SET "subtotal" = "basePrice" * "numberOfDays",
    "taxRate" = 0,
    "taxAmount" = GREATEST("totalPrice" - ("basePrice" * "numberOfDays"), 0)
WHERE "type" = 'RENTAL';
