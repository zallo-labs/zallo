/*
  Warnings:

  - The primary key for the `Approval` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `txHash` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Approval` table. All the data in the column will be lost.
  - The primary key for the `Approver` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `Approver` table. All the data in the column will be lost.
  - You are about to drop the column `quorumHash` on the `Approver` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Approver` table. All the data in the column will be lost.
  - You are about to drop the column `walletRef` on the `Approver` table. All the data in the column will be lost.
  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Contact` table. All the data in the column will be lost.
  - The primary key for the `Reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `Submission` table. All the data in the column will be lost.
  - You are about to drop the column `txHash` on the `Submission` table. All the data in the column will be lost.
  - The primary key for the `TokenLimit` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accountId` on the `TokenLimit` table. All the data in the column will be lost.
  - You are about to drop the column `walletRef` on the `TokenLimit` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Quorum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tx` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Wallet` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[deviceId,name]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposalHash` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `configId` to the `Approver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceId` to the `Approver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceId` to the `Reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proposalHash` to the `Submission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `configId` to the `TokenLimit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_accountId_txHash_fkey";

-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_userId_fkey";

-- DropForeignKey
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_accountId_walletRef_fkey";

-- DropForeignKey
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_accountId_walletRef_quorumHash_fkey";

-- DropForeignKey
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userId_fkey";

-- DropForeignKey
ALTER TABLE "Quorum" DROP CONSTRAINT "Quorum_accountId_createProposalHash_fkey";

-- DropForeignKey
ALTER TABLE "Quorum" DROP CONSTRAINT "Quorum_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Quorum" DROP CONSTRAINT "Quorum_accountId_walletRef_fkey";

-- DropForeignKey
ALTER TABLE "Quorum" DROP CONSTRAINT "Quorum_removeProposalAccountId_removeProposalHash_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_accountId_txHash_fkey";

-- DropForeignKey
ALTER TABLE "TokenLimit" DROP CONSTRAINT "TokenLimit_accountId_walletRef_fkey";

-- DropForeignKey
ALTER TABLE "Tx" DROP CONSTRAINT "Tx_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Tx" DROP CONSTRAINT "Tx_accountId_walletRef_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_accountId_createProposalHash_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_removeProposalAccountId_removeProposalHash_fkey";

-- DropIndex
DROP INDEX "Contact_userId_name_key";

-- AlterTable
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_pkey",
DROP COLUMN "txHash",
DROP COLUMN "userId",
ADD COLUMN     "deviceId" CHAR(42) NOT NULL,
ADD COLUMN     "proposalHash" CHAR(66) NOT NULL,
ADD CONSTRAINT "Approval_pkey" PRIMARY KEY ("accountId", "proposalHash", "deviceId");

-- AlterTable
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_pkey",
DROP COLUMN "accountId",
DROP COLUMN "quorumHash",
DROP COLUMN "userId",
DROP COLUMN "walletRef",
ADD COLUMN     "configId" INTEGER NOT NULL,
ADD COLUMN     "deviceId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Approver_pkey" PRIMARY KEY ("configId", "deviceId");

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "userId",
ADD COLUMN     "deviceId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("deviceId", "addr");

-- AlterTable
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pkey",
DROP COLUMN "userId",
ADD COLUMN     "deviceId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Reaction_pkey" PRIMARY KEY ("accountId", "key", "nonce", "deviceId");

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "accountId",
DROP COLUMN "txHash",
ADD COLUMN     "proposalHash" CHAR(66) NOT NULL;

-- AlterTable
ALTER TABLE "TokenLimit" DROP CONSTRAINT "TokenLimit_pkey",
DROP COLUMN "accountId",
DROP COLUMN "walletRef",
ADD COLUMN     "configId" INTEGER NOT NULL,
ADD CONSTRAINT "TokenLimit_pkey" PRIMARY KEY ("configId", "token");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "accountId" CHAR(42) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deviceId" CHAR(42) NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("accountId", "deviceId");

-- DropTable
DROP TABLE "Quorum";

-- DropTable
DROP TABLE "Tx";

-- DropTable
DROP TABLE "Wallet";

-- CreateTable
CREATE TABLE "Device" (
    "id" CHAR(42) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserState" (
    "id" INTEGER NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "deviceId" CHAR(42) NOT NULL,
    "proposalHash" CHAR(66) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserConfig" (
    "id" INTEGER NOT NULL,
    "stateId" INTEGER NOT NULL,
    "spendingAllowlisted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "hash" CHAR(66) NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "salt" CHAR(18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_deviceId_name_key" ON "Contact"("deviceId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_accountId_deviceId_fkey" FOREIGN KEY ("accountId", "deviceId") REFERENCES "User"("accountId", "deviceId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_proposalHash_fkey" FOREIGN KEY ("proposalHash") REFERENCES "Proposal"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "UserState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenLimit" ADD CONSTRAINT "TokenLimit_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_proposalHash_fkey" FOREIGN KEY ("proposalHash") REFERENCES "Proposal"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_proposalHash_fkey" FOREIGN KEY ("proposalHash") REFERENCES "Proposal"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
