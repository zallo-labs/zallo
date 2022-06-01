/*
  Warnings:

  - The primary key for the `ContractMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `selector` on the `ContractMethod` table. All the data in the column will be lost.
  - Added the required column `sighash` to the `ContractMethod` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ContractMethod_selector_idx";

-- AlterTable
ALTER TABLE "ContractMethod" DROP CONSTRAINT "ContractMethod_pkey",
DROP COLUMN "selector",
ADD COLUMN     "sighash" TEXT NOT NULL,
ADD CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contract", "sighash");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");
