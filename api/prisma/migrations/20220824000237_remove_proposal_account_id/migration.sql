/*
  Warnings:

  - A unique constraint covering the columns `[removeProposalAccountId,removeProposalHash]` on the table `Wallet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Quorum" DROP CONSTRAINT "Quorum_accountId_removeProposalHash_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_accountId_removeProposalHash_fkey";

-- DropIndex
DROP INDEX "Wallet_accountId_removeProposalHash_key";

-- AlterTable
ALTER TABLE "Quorum" ADD COLUMN     "removeProposalAccountId" CHAR(42);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_removeProposalAccountId_removeProposalHash_key" ON "Wallet"("removeProposalAccountId", "removeProposalHash");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_removeProposalAccountId_removeProposalHash_fkey" FOREIGN KEY ("removeProposalAccountId", "removeProposalHash") REFERENCES "Tx"("accountId", "hash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_removeProposalAccountId_removeProposalHash_fkey" FOREIGN KEY ("removeProposalAccountId", "removeProposalHash") REFERENCES "Tx"("accountId", "hash") ON DELETE SET NULL ON UPDATE CASCADE;
