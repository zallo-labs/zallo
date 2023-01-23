/*
  Warnings:

  - You are about to drop the column `activeId` on the `Quorum` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[activeStateId]` on the table `Quorum` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Quorum" DROP CONSTRAINT "Quorum_activeId_fkey";

-- DropIndex
DROP INDEX "Quorum_activeId_key";

-- AlterTable
ALTER TABLE "Quorum" DROP COLUMN "activeId",
ADD COLUMN     "activeStateId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Quorum_activeStateId_key" ON "Quorum"("activeStateId");

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_activeStateId_fkey" FOREIGN KEY ("activeStateId") REFERENCES "QuorumState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
