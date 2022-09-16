/*
  Warnings:

  - Made the column `deploySalt` on table `Account` required. This step will fail if there are existing NULL values in that column.
  - Made the column `impl` on table `Account` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "deploySalt" SET NOT NULL,
ALTER COLUMN "impl" SET NOT NULL;
