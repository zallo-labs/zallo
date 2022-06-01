/*
  Warnings:

  - You are about to drop the `Contract` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Contract";

-- CreateTable
CREATE TABLE "ContractMethod" (
    "contractAddr" TEXT NOT NULL,
    "selector" TEXT NOT NULL,
    "abi" JSONB NOT NULL,

    CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contractAddr","selector")
);
