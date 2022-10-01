/*
  Warnings:

  - You are about to drop the column `userAccountId` on the `Proposal` table. All the data in the column will be lost.
  - You are about to drop the column `userDeviceId` on the `Proposal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_userAccountId_userDeviceId_fkey";

-- AlterTable
ALTER TABLE "Proposal" DROP COLUMN "userAccountId",
DROP COLUMN "userDeviceId";

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_accountId_proposerId_fkey" FOREIGN KEY ("accountId", "proposerId") REFERENCES "User"("accountId", "deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
