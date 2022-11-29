/*
  Warnings:

  - You are about to drop the column `isDeployed` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `Approval` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `proposalHash` on the `Approval` table. All the data in the column will be lost.
  - The primary key for the `Proposal` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hash` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `proposalHash` on the `UserState` table. All the data in the column will be lost.
  - You are about to drop the `Submission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubmissionResponse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `proposalId` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_proposalHash_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_proposalHash_fkey";

-- DropForeignKey
ALTER TABLE "SubmissionResponse" DROP CONSTRAINT "SubmissionResponse_hash_fkey";

-- DropForeignKey
ALTER TABLE "UserState" DROP CONSTRAINT "UserState_proposalHash_fkey";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "isDeployed",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_pkey",
DROP COLUMN "proposalHash",
ADD COLUMN     "proposalId" CHAR(66) NOT NULL,
ADD CONSTRAINT "Approval_pkey" PRIMARY KEY ("proposalId", "deviceId");

-- AlterTable
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_pkey",
DROP COLUMN "hash",
ADD COLUMN     "id" CHAR(66) NOT NULL,
ADD CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserState" DROP COLUMN "proposalHash",
ADD COLUMN     "proposalId" CHAR(66);

-- DropTable
DROP TABLE "Submission";

-- DropTable
DROP TABLE "SubmissionResponse";

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" CHAR(66) NOT NULL,
    "proposalId" CHAR(66) NOT NULL,
    "nonce" INTEGER NOT NULL,
    "gasLimit" DECIMAL(19,0) NOT NULL,
    "gasPrice" DECIMAL(19,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "TransactionResponse" (
    "transactionHash" CHAR(66) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "response" CHAR(66) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionResponse_pkey" PRIMARY KEY ("transactionHash")
);

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionResponse" ADD CONSTRAINT "TransactionResponse_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
