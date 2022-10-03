/*
  Warnings:

  - You are about to drop the column `latestStateId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stateId` on the `UserConfig` table. All the data in the column will be lost.
  - The primary key for the `UserState` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserState` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accountId,deviceId,latestStateNonce]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `latestStateNonce` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `UserConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deviceId` to the `UserConfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stateNonce` to the `UserConfig` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_latestStateId_fkey";

-- DropForeignKey
ALTER TABLE "UserConfig" DROP CONSTRAINT "UserConfig_stateId_fkey";

-- DropIndex
DROP INDEX "User_latestStateId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "latestStateId",
ADD COLUMN     "latestStateNonce" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserConfig" DROP COLUMN "stateId",
ADD COLUMN     "accountId" CHAR(42) NOT NULL,
ADD COLUMN     "deviceId" CHAR(42) NOT NULL,
ADD COLUMN     "stateNonce" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserState" DROP CONSTRAINT "UserState_pkey",
DROP COLUMN "id",
ADD COLUMN     "nonce" SERIAL NOT NULL,
ADD CONSTRAINT "UserState_pkey" PRIMARY KEY ("accountId", "deviceId", "nonce");

-- CreateIndex
CREATE UNIQUE INDEX "User_accountId_deviceId_latestStateNonce_key" ON "User"("accountId", "deviceId", "latestStateNonce");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountId_deviceId_latestStateNonce_fkey" FOREIGN KEY ("accountId", "deviceId", "latestStateNonce") REFERENCES "UserState"("accountId", "deviceId", "nonce") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserConfig" ADD CONSTRAINT "UserConfig_accountId_deviceId_stateNonce_fkey" FOREIGN KEY ("accountId", "deviceId", "stateNonce") REFERENCES "UserState"("accountId", "deviceId", "nonce") ON DELETE CASCADE ON UPDATE CASCADE;
