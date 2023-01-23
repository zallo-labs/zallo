/*
  Warnings:

  - Made the column `name` on table `Quorum` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Quorum" ALTER COLUMN "name" SET NOT NULL;
