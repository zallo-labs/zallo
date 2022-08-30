-- CreateEnum
CREATE TYPE "LimitPeriod" AS ENUM ('Day', 'Week', 'Month');

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "allowSpendingUnlisted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TokenLimit" (
    "accountId" CHAR(42) NOT NULL,
    "walletRef" CHAR(10) NOT NULL,
    "token" CHAR(42) NOT NULL,
    "value" TEXT NOT NULL,
    "period" "LimitPeriod" NOT NULL,

    CONSTRAINT "TokenLimit_pkey" PRIMARY KEY ("accountId","walletRef","token")
);

-- AddForeignKey
ALTER TABLE "TokenLimit" ADD CONSTRAINT "TokenLimit_accountId_walletRef_fkey" FOREIGN KEY ("accountId", "walletRef") REFERENCES "Wallet"("accountId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;
