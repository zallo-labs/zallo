/*
  Warnings:

  - The primary key for the `Approval` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deviceId` on the `Approval` table. All the data in the column will be lost.
  - The primary key for the `Approver` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deviceId` on the `Approver` table. All the data in the column will be lost.
  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deviceId` on the `Contact` table. All the data in the column will be lost.
  - The primary key for the `Reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `deviceId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,name]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Approver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_proposerId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_deviceId_fkey";

-- DropIndex
DROP INDEX "Contact_deviceId_name_key";

-- AlterTable
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_pkey",
DROP COLUMN "deviceId",
ADD COLUMN     "userId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Approval_pkey" PRIMARY KEY ("proposalId", "userId");

-- AlterTable
ALTER TABLE "Approver" DROP CONSTRAINT "Approver_pkey",
DROP COLUMN "deviceId",
ADD COLUMN     "userId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Approver_pkey" PRIMARY KEY ("quorumStateId", "userId");

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "deviceId",
ADD COLUMN     "userId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("userId", "addr");

-- AlterTable
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pkey",
DROP COLUMN "deviceId",
ADD COLUMN     "userId" CHAR(42) NOT NULL,
ADD CONSTRAINT "Reaction_pkey" PRIMARY KEY ("commentId", "userId");

-- DropTable
DROP TABLE "Device";

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(42) NOT NULL,
    "name" TEXT,
    "pushToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_name_key" ON "Contact"("userId", "name");

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
