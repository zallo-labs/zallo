/*
  Warnings:

  - The primary key for the `Approval` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `Approval` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_accountId_fkey";

-- AlterTable
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_pkey",
DROP COLUMN "accountId",
ADD CONSTRAINT "Approval_pkey" PRIMARY KEY ("proposalHash", "deviceId");
