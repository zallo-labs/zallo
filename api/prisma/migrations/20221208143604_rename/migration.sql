/*
  Warnings:

  - The values [allow,deny] on the enum `SpendingFallback` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SpendingFallback_new" AS ENUM ('Allow', 'Deny');
ALTER TABLE "QuorumState" ALTER COLUMN "spendingFallback" DROP DEFAULT;
ALTER TABLE "QuorumState" ALTER COLUMN "spendingFallback" TYPE "SpendingFallback_new" USING ("spendingFallback"::text::"SpendingFallback_new");
ALTER TYPE "SpendingFallback" RENAME TO "SpendingFallback_old";
ALTER TYPE "SpendingFallback_new" RENAME TO "SpendingFallback";
DROP TYPE "SpendingFallback_old";
ALTER TABLE "QuorumState" ALTER COLUMN "spendingFallback" SET DEFAULT 'Allow';
COMMIT;

-- AlterTable
ALTER TABLE "QuorumState" ALTER COLUMN "spendingFallback" SET DEFAULT 'Allow';
