/*
  Warnings:

  - You are about to drop the column `value` on the `TokenLimit` table. All the data in the column will be lost.
  - Added the required column `amount` to the `TokenLimit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenLimit" DROP COLUMN "value",
ADD COLUMN     "amount" TEXT NOT NULL;
