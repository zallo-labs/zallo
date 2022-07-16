/*
  Warnings:

  - You are about to alter the column `salt` on the `Tx` table. The data in that column could be lost. The data in that column will be cast from `Char(66)` to `Char(18)`.

*/
-- AlterTable
ALTER TABLE "Tx" ALTER COLUMN "salt" SET DATA TYPE CHAR(18);
