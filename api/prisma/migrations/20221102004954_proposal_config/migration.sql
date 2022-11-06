/*
  Warnings:

  - Added the required column `configId` to the `Proposal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "configId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_configId_fkey" FOREIGN KEY ("configId") REFERENCES "UserConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
