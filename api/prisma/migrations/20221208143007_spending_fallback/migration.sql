/*
  Warnings:

  - You are about to drop the column `spendingAllowlisted` on the `QuorumState` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SpendingFallback" AS ENUM ('allow', 'deny');

-- AlterTable
ALTER TABLE "QuorumState" DROP COLUMN "spendingAllowlisted",
ADD COLUMN     "spendingFallback" "SpendingFallback" NOT NULL DEFAULT 'allow';
