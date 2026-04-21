/*
  Warnings:

  - Added the required column `primaryimageURL` to the `Car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "logoPublicId" TEXT;

-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "primaryimageURL" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CarImage" ADD COLUMN     "publicId" TEXT;
