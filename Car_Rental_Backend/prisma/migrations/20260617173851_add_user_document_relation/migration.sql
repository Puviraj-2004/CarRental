/*
  Warnings:

  - You are about to drop the column `userId` on the `Documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[documentId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Documents" DROP CONSTRAINT "Documents_userId_fkey";

-- DropIndex
DROP INDEX "Documents_userId_idx";

-- DropIndex
DROP INDEX "Documents_userId_key";

-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "documentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_documentId_key" ON "User"("documentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
