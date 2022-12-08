-- CreateEnum
CREATE TYPE "LimitPeriod" AS ENUM ('Day', 'Week', 'Month');

-- CreateTable
CREATE TABLE "Device" (
    "id" CHAR(42) NOT NULL,
    "name" TEXT,
    "pushToken" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" CHAR(42) NOT NULL,
    "impl" CHAR(42) NOT NULL,
    "deploySalt" CHAR(66) NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quorum" (
    "accountId" CHAR(42) NOT NULL,
    "key" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "Quorum_pkey" PRIMARY KEY ("accountId","key")
);

-- CreateTable
CREATE TABLE "QuorumState" (
    "id" SERIAL NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "quorumKey" INTEGER NOT NULL,
    "proposalId" CHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "spendingAllowlisted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuorumState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approver" (
    "quorumStateId" INTEGER NOT NULL,
    "deviceId" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("quorumStateId","deviceId")
);

-- CreateTable
CREATE TABLE "TokenLimit" (
    "quorumStateId" INTEGER NOT NULL,
    "token" CHAR(42) NOT NULL,
    "amount" TEXT NOT NULL,
    "period" "LimitPeriod" NOT NULL,

    CONSTRAINT "TokenLimit_pkey" PRIMARY KEY ("quorumStateId","token")
);

-- CreateTable
CREATE TABLE "Contact" (
    "deviceId" CHAR(42) NOT NULL,
    "addr" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("deviceId","addr")
);

-- CreateTable
CREATE TABLE "ContractMethod" (
    "contract" CHAR(42) NOT NULL,
    "sighash" CHAR(10) NOT NULL,
    "fragment" JSONB NOT NULL,

    CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contract","sighash")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" CHAR(66) NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "proposerId" CHAR(42) NOT NULL,
    "quorumKey" INTEGER NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" TEXT,
    "data" TEXT,
    "salt" CHAR(18) NOT NULL,
    "gasLimit" DECIMAL(19,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" CHAR(66) NOT NULL,
    "proposalId" CHAR(66) NOT NULL,
    "nonce" INTEGER NOT NULL,
    "gasLimit" DECIMAL(19,0) NOT NULL,
    "gasPrice" DECIMAL(19,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "TransactionResponse" (
    "transactionHash" CHAR(66) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "response" CHAR(66) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionResponse_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "Approval" (
    "proposalId" CHAR(66) NOT NULL,
    "deviceId" CHAR(42) NOT NULL,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("proposalId","deviceId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "key" TEXT NOT NULL,
    "authorId" CHAR(42) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "commentId" INTEGER NOT NULL,
    "deviceId" CHAR(42) NOT NULL,
    "emojis" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accountId" CHAR(42),

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("commentId","deviceId")
);

-- CreateIndex
CREATE INDEX "quorum_createdAt" ON "QuorumState"("accountId", "quorumKey", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_deviceId_name_key" ON "Contact"("deviceId", "name");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");

-- CreateIndex
CREATE INDEX "Comment_accountId_key_idx" ON "Comment"("accountId", "key");

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuorumState" ADD CONSTRAINT "QuorumState_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuorumState" ADD CONSTRAINT "QuorumState_accountId_quorumKey_fkey" FOREIGN KEY ("accountId", "quorumKey") REFERENCES "Quorum"("accountId", "key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuorumState" ADD CONSTRAINT "QuorumState_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_quorumStateId_fkey" FOREIGN KEY ("quorumStateId") REFERENCES "QuorumState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TokenLimit" ADD CONSTRAINT "TokenLimit_quorumStateId_fkey" FOREIGN KEY ("quorumStateId") REFERENCES "QuorumState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_accountId_quorumKey_fkey" FOREIGN KEY ("accountId", "quorumKey") REFERENCES "Quorum"("accountId", "key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionResponse" ADD CONSTRAINT "TransactionResponse_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
