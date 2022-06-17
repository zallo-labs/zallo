-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Safe" (
    "id" CHAR(42) NOT NULL,
    "name" TEXT,
    "deploySalt" CHAR(66),

    CONSTRAINT "Safe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "safeId" CHAR(42) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "name" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("safeId","hash")
);

-- CreateTable
CREATE TABLE "Approver" (
    "id" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupApprover" (
    "safeId" CHAR(42) NOT NULL,
    "groupHash" CHAR(66) NOT NULL,
    "approverId" CHAR(42) NOT NULL,
    "weight" DECIMAL(79,0) NOT NULL,

    CONSTRAINT "GroupApprover_pkey" PRIMARY KEY ("safeId","groupHash","approverId")
);

-- CreateTable
CREATE TABLE "Contact" (
    "approverId" CHAR(42) NOT NULL,
    "addr" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("approverId","addr")
);

-- CreateTable
CREATE TABLE "ContractMethod" (
    "contract" CHAR(42) NOT NULL,
    "sighash" CHAR(10) NOT NULL,
    "fragment" JSONB NOT NULL,

    CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contract","sighash")
);

-- CreateTable
CREATE TABLE "Tx" (
    "safeId" CHAR(42) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tx_pkey" PRIMARY KEY ("safeId","hash")
);

-- CreateTable
CREATE TABLE "Submission" (
    "hash" CHAR(66) NOT NULL,
    "safeId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nonce" INTEGER NOT NULL,
    "gasLimit" BIGINT NOT NULL,
    "gasPrice" BIGINT,
    "finalized" BOOLEAN NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Op" (
    "safeId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" DECIMAL(79,0) NOT NULL,
    "data" TEXT NOT NULL,
    "nonce" DECIMAL(79,0) NOT NULL,

    CONSTRAINT "Op_pkey" PRIMARY KEY ("safeId","txHash","hash")
);

-- CreateTable
CREATE TABLE "Approval" (
    "approverId" CHAR(42) NOT NULL,
    "safeId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "signature" TEXT NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("safeId","txHash","approverId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_approverId_name_key" ON "Contact"("approverId", "name");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupApprover" ADD CONSTRAINT "GroupApprover_safeId_groupHash_fkey" FOREIGN KEY ("safeId", "groupHash") REFERENCES "Group"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupApprover" ADD CONSTRAINT "GroupApprover_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Op" ADD CONSTRAINT "Op_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Op" ADD CONSTRAINT "Op_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;
