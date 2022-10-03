-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_latestStateId_fkey";

-- AlterTable
ALTER TABLE "UserState" ALTER COLUMN "deviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_latestStateId_fkey" FOREIGN KEY ("latestStateId") REFERENCES "UserState"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
