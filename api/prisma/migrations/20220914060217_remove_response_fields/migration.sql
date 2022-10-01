/*
  Warnings:

  - You are about to drop the column `blockNumber` on the `SubmissionResponse` table. All the data in the column will be lost.
  - You are about to drop the column `gasUsed` on the `SubmissionResponse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SubmissionResponse" DROP COLUMN "blockNumber",
DROP COLUMN "gasUsed";
