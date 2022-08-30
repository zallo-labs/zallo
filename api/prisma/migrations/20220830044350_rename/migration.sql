/*
  Warnings:

  - You are about to drop the column `spendingWhitelisted` on the `Wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "spendingWhitelisted",
ADD COLUMN     "spendingAllowlistEnabled" BOOLEAN NOT NULL DEFAULT false;
