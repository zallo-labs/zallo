/*
  Warnings:

  - You are about to drop the column `latestStateId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,latestOfUserDeviceId]` on the table `UserState` will be added. If there are existing duplicate values, this will fail.
  - Made the column `deviceId` on table `UserState` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_latestStateId_fkey";

-- DropIndex
DROP INDEX "User_latestStateId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "latestStateId";

-- AlterTable
ALTER TABLE "UserState" ADD COLUMN     "latestOfUserDeviceId" CHAR(42),
ALTER COLUMN "deviceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserState_accountId_latestOfUserDeviceId_key" ON "UserState"("accountId", "latestOfUserDeviceId");

-- AddForeignKey
ALTER TABLE "UserState" ADD CONSTRAINT "UserState_accountId_latestOfUserDeviceId_fkey" FOREIGN KEY ("accountId", "latestOfUserDeviceId") REFERENCES "User"("accountId", "deviceId") ON DELETE CASCADE ON UPDATE CASCADE;
