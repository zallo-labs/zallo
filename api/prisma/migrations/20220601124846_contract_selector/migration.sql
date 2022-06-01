/*
  Warnings:

  - The primary key for the `ContractMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sighash` on the `ContractMethod` table. All the data in the column will be lost.
  - Added the required column `contract` to the `ContractMethod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selector` to the `ContractMethod` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `fragment` on the `ContractMethod` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ContractMethod" DROP CONSTRAINT "ContractMethod_pkey",
DROP COLUMN "sighash",
ADD COLUMN     "contract" TEXT NOT NULL,
ADD COLUMN     "selector" TEXT NOT NULL,
DROP COLUMN "fragment",
ADD COLUMN     "fragment" JSONB NOT NULL,
ADD CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contract", "selector");

-- CreateIndex
CREATE INDEX "ContractMethod_selector_idx" ON "ContractMethod"("selector");
