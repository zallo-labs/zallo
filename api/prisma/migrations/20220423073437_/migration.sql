/*
  Warnings:

  - You are about to drop the column `isCf` on the `Safe` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Safe" DROP COLUMN "isCf",
ADD COLUMN     "name" TEXT;
