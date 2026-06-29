ALTER TABLE "Booking"
ADD COLUMN "documentRejectedAt" TIMESTAMP(3),
ADD COLUMN "documentReuploadDeadline" TIMESTAMP(3);

CREATE INDEX "Booking_documentReuploadDeadline_idx" ON "Booking"("documentReuploadDeadline");
