/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Documents` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_bookingId_fkey";

-- DropIndex
DROP INDEX "Documents_bookingId_idx";

-- DropIndex
DROP INDEX "Documents_bookingId_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "documentId" TEXT;

-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "bookingId";

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
