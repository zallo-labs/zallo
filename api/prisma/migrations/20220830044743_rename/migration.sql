/*
  Warnings:

  - You are about to drop the column `spendingAllowlistEnabled` on the `Wallet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "spendingAllowlistEnabled",
ADD COLUMN     "spendingAllowlisted" BOOLEAN NOT NULL DEFAULT false;
