/*
  Warnings:

  - The primary key for the `Tx` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `txhash` on the `Tx` table. All the data in the column will be lost.
  - Added the required column `txHash` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Op" DROP CONSTRAINT "Op_safeId_txHash_fkey";

-- AlterTable
ALTER TABLE "Tx" DROP CONSTRAINT "Tx_pkey",
DROP COLUMN "txhash",
ADD COLUMN     "txHash" CHAR(66) NOT NULL,
ADD CONSTRAINT "Tx_pkey" PRIMARY KEY ("safeId", "txHash");

-- AddForeignKey
ALTER TABLE "Op" ADD CONSTRAINT "Op_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "txHash") ON DELETE CASCADE ON UPDATE CASCADE;
