/*
  Warnings:

  - The primary key for the `Approver` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Approver` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `approverId` on the `Contact` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - You are about to alter the column `addr` on the `Contact` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - The primary key for the `ContractMethod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `contract` on the `ContractMethod` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - You are about to alter the column `sighash` on the `ContractMethod` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(10)`.
  - The primary key for the `Group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `safeId` on the `Group` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - You are about to alter the column `hash` on the `Group` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(66)`.
  - The primary key for the `GroupApprover` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `safeId` on the `GroupApprover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - You are about to alter the column `groupHash` on the `GroupApprover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(66)`.
  - You are about to alter the column `approverId` on the `GroupApprover` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - You are about to alter the column `weight` on the `GroupApprover` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(79,0)`.
  - The primary key for the `Safe` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Safe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(42)`.
  - You are about to alter the column `deploySalt` on the `Safe` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(66)`.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_approverId_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_safeId_fkey";

-- DropForeignKey
ALTER TABLE "GroupApprover" DROP CONSTRAINT "GroupApprover_approverId_fkey";

-- DropForeignKey
ALTER TABLE "GroupApprover" DROP CONSTRAINT "GroupApprover_safeId_groupHash_fkey";

-- AlterTable
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(42),
ADD CONSTRAINT "Approver_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
ALTER COLUMN "approverId" SET DATA TYPE CHAR(42),
ALTER COLUMN "addr" SET DATA TYPE CHAR(42),
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("approverId", "addr");

-- AlterTable
ALTER TABLE "ContractMethod" DROP CONSTRAINT "ContractMethod_pkey",
ALTER COLUMN "contract" SET DATA TYPE CHAR(42),
ALTER COLUMN "sighash" SET DATA TYPE CHAR(10),
ADD CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contract", "sighash");

-- AlterTable
ALTER TABLE "Group" DROP CONSTRAINT "Group_pkey",
ALTER COLUMN "safeId" SET DATA TYPE CHAR(42),
ALTER COLUMN "hash" SET DATA TYPE CHAR(66),
ADD CONSTRAINT "Group_pkey" PRIMARY KEY ("safeId", "hash");

-- AlterTable
ALTER TABLE "GroupApprover" DROP CONSTRAINT "GroupApprover_pkey",
ALTER COLUMN "safeId" SET DATA TYPE CHAR(42),
ALTER COLUMN "groupHash" SET DATA TYPE CHAR(66),
ALTER COLUMN "approverId" SET DATA TYPE CHAR(42),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(79,0),
ADD CONSTRAINT "GroupApprover_pkey" PRIMARY KEY ("safeId", "groupHash", "approverId");

-- AlterTable
ALTER TABLE "Safe" DROP CONSTRAINT "Safe_pkey",
ALTER COLUMN "id" SET DATA TYPE CHAR(42),
ALTER COLUMN "deploySalt" SET DATA TYPE CHAR(66),
ADD CONSTRAINT "Safe_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Tx" (
    "safeId" CHAR(42) NOT NULL,
    "txhash" CHAR(66) NOT NULL,

    CONSTRAINT "Tx_pkey" PRIMARY KEY ("safeId","txhash")
);

-- CreateTable
CREATE TABLE "Op" (
    "safeId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" DECIMAL(79,0) NOT NULL,
    "data" TEXT NOT NULL,
    "nonce" DECIMAL(79,0) NOT NULL,

    CONSTRAINT "Op_pkey" PRIMARY KEY ("safeId","txHash","hash")
);

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupApprover" ADD CONSTRAINT "GroupApprover_safeId_groupHash_fkey" FOREIGN KEY ("safeId", "groupHash") REFERENCES "Group"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupApprover" ADD CONSTRAINT "GroupApprover_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Op" ADD CONSTRAINT "Op_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Op" ADD CONSTRAINT "Op_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "txhash") ON DELETE CASCADE ON UPDATE CASCADE;
