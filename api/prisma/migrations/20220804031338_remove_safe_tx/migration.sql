/*
  Warnings:

  - You are about to drop the column `txHash` on the `Safe` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Safe" DROP CONSTRAINT "Safe_id_txHash_fkey";

-- DropIndex
DROP INDEX "Safe_id_txHash_key";

-- AlterTable
ALTER TABLE "Safe" DROP COLUMN "txHash";
