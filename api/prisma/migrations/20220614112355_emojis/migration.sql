/*
  Warnings:

  - You are about to drop the column `reaction` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "reaction",
ADD COLUMN     "emojis" TEXT[];
