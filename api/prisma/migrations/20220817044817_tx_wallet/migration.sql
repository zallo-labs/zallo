/*
  Warnings:

  - Added the required column `walletRef` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "walletRef" CHAR(10) NOT NULL;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_accountId_walletRef_fkey" FOREIGN KEY ("accountId", "walletRef") REFERENCES "Wallet"("accountId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;
