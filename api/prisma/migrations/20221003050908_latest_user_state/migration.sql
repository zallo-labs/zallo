/*
  Warnings:

  - A unique constraint covering the columns `[latestStateId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `latestStateId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "latestStateId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_latestStateId_key" ON "User"("latestStateId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_latestStateId_fkey" FOREIGN KEY ("latestStateId") REFERENCES "UserState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
