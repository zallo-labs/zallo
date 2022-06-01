-- CreateTable
CREATE TABLE "Contract" (
    "addr" TEXT NOT NULL,
    "abi" JSONB NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("addr")
);
