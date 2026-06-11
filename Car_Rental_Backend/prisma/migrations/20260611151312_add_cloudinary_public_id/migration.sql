-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "primaryImagePublicId" TEXT;

-- AlterTable
ALTER TABLE "CarImage" ADD COLUMN     "publicId" TEXT NOT NULL DEFAULT '';
