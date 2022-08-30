/*
  Warnings:

  - You are about to drop the column `allowSpendingUnlisted` on the `Wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "allowSpendingUnlisted",
ADD COLUMN     "spendingWhitelisted" BOOLEAN NOT NULL DEFAULT false;
