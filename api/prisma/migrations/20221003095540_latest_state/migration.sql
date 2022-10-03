/*
  Warnings:

  - You are about to drop the column `latestStateNonce` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `UserConfig` table. All the data in the column will be lost.
  - You are about to drop the column `deviceId` on the `UserConfig` table. All the data in the column will be lost.
  - You are about to drop the column `stateNonce` on the `UserConfig` table. All the data in the column will be lost.
  - The primary key for the `UserState` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nonce` on the `UserState` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[latestStateId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `latestStateId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateId` to the `UserConfig` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_accountId_deviceId_latestStateNonce_fkey";

-- DropForeignKey
ALTER TABLE "UserConfig" DROP CONSTRAINT "UserConfig_accountId_deviceId_stateNonce_fkey";

-- DropIndex
DROP INDEX "User_accountId_deviceId_latestStateNonce_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "latestStateNonce",
ADD COLUMN     "latestStateId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserConfig" DROP COLUMN "accountId",
DROP COLUMN "deviceId",
DROP COLUMN "stateNonce",
ADD COLUMN     "stateId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserState" DROP CONSTRAINT "UserState_pkey",
DROP COLUMN "nonce",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserState_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_latestStateId_key" ON "User"("latestStateId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_latestStateId_fkey" FOREIGN KEY ("latestStateId") REFERENCES "UserState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "UserState"("id") ON DELETE CASCADE ON UPDATE CASCADE;
