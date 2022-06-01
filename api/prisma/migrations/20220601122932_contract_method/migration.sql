/*
  Warnings:

  - The primary key for the `ContractMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `abi` on the `ContractMethod` table. All the data in the column will be lost.
  - You are about to drop the column `contractAddr` on the `ContractMethod` table. All the data in the column will be lost.
  - You are about to drop the column `selector` on the `ContractMethod` table. All the data in the column will be lost.
  - Added the required column `fragment` to the `ContractMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sighash` to the `ContractMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ContractMethod" DROP CONSTRAINT "ContractMethod_pkey",
DROP COLUMN "abi",
DROP COLUMN "contractAddr",
DROP COLUMN "selector",
ADD COLUMN     "fragment" TEXT NOT NULL,
ADD COLUMN     "sighash" TEXT NOT NULL,
ADD CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("sighash");
