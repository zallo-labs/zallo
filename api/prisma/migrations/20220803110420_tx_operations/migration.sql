/*
  Warnings:

  - A unique constraint covering the columns `[safeId,txHash]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[safeId,txHash]` on the table `Quorum` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,txHash]` on the table `Safe` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "txHash" CHAR(66);

-- AlterTable
ALTER TABLE "Quorum" ADD COLUMN     "txHash" CHAR(66);

-- AlterTable
ALTER TABLE "Safe" ADD COLUMN     "txHash" CHAR(66);

-- CreateIndex
CREATE UNIQUE INDEX "Account_safeId_txHash_key" ON "Account"("safeId", "txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Quorum_safeId_txHash_key" ON "Quorum"("safeId", "txHash");

-- CreateIndex
CREATE UNIQUE INDEX "Safe_id_txHash_key" ON "Safe"("id", "txHash");

-- AddForeignKey
ALTER TABLE "Safe" ADD CONSTRAINT "Safe_id_txHash_fkey" FOREIGN KEY ("id", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;
