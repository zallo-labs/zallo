/*
  Warnings:

  - Added the required column `proposerId` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAccountId` to the `Proposal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userDeviceId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "proposerId" CHAR(42) NOT NULL,
ADD COLUMN     "userAccountId" CHAR(42) NOT NULL,
ADD COLUMN     "userDeviceId" CHAR(42) NOT NULL;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_userAccountId_userDeviceId_fkey" FOREIGN KEY ("userAccountId", "userDeviceId") REFERENCES "User"("accountId", "deviceId") ON DELETE RESTRICT ON UPDATE CASCADE;
