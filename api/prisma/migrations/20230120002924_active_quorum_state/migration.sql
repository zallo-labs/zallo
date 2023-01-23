/*
  Warnings:

  - A unique constraint covering the columns `[activeId]` on the table `Quorum` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Quorum" ADD COLUMN     "activeId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Quorum_activeId_key" ON "Quorum"("activeId");

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_activeId_fkey" FOREIGN KEY ("activeId") REFERENCES "QuorumState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
