-- CreateEnum
CREATE TYPE "AbiSource" AS ENUM ('VERIFIED', 'STANDARD', 'DECOMPILED');

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
CREATE TABLE "User" (
    "id" CHAR(42) NOT NULL,
    "name" TEXT,
    "pushToken" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "userId" CHAR(42) NOT NULL,
    "addr" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("userId","addr")
);

-- CreateTable
CREATE TABLE "Policy" (
    "accountId" CHAR(42) NOT NULL,
    "key" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "activeId" BIGINT,
    "draftId" BIGINT,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("accountId","key")
);

-- CreateTable
CREATE TABLE "PolicyState" (
    "id" BIGSERIAL NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "policyKey" BIGINT NOT NULL,
    "proposalId" CHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "threshold" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PolicyState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approver" (
    "stateId" BIGINT NOT NULL,
    "userId" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("stateId","userId")
);

-- CreateTable
CREATE TABLE "Target" (
    "stateId" BIGINT NOT NULL,
    "to" TEXT NOT NULL,
    "selectors" TEXT[],

    CONSTRAINT "Target_pkey" PRIMARY KEY ("stateId","to")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" CHAR(66) NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "proposerId" CHAR(42) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" DECIMAL(79,0),
    "data" TEXT,
    "nonce" BIGINT NOT NULL,
    "gasLimit" BIGINT,
    "estimatedOpGas" BIGINT NOT NULL,
    "feeToken" CHAR(42),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "hash" CHAR(66) NOT NULL,
    "proposalId" CHAR(66) NOT NULL,
    "gasLimit" DECIMAL(19,0) NOT NULL,
    "gasPrice" DECIMAL(19,0),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "TransactionReceipt" (
    "transactionHash" CHAR(66) NOT NULL,
    "success" BOOLEAN NOT NULL,
    "response" TEXT,
    "gasUsed" DECIMAL(19,0) NOT NULL,
    "gasPrice" DECIMAL(19,0) NOT NULL,
    "fee" DECIMAL(79,0) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransactionReceipt_pkey" PRIMARY KEY ("transactionHash")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" SERIAL NOT NULL,
    "transactionHash" CHAR(66) NOT NULL,
    "token" CHAR(42) NOT NULL,
    "from" CHAR(42) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "amount" DECIMAL(79,0) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Simulation" (
    "proposalId" CHAR(66) NOT NULL,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("proposalId")
);

-- CreateTable
CREATE TABLE "SimulatedTransfer" (
    "id" SERIAL NOT NULL,
    "proposalId" CHAR(66) NOT NULL,
    "token" CHAR(42) NOT NULL,
    "from" CHAR(42) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "amount" DECIMAL(79,0) NOT NULL,

    CONSTRAINT "SimulatedTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "proposalId" CHAR(66) NOT NULL,
    "userId" CHAR(42) NOT NULL,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("proposalId","userId")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" CHAR(42) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractFunction" (
    "id" SERIAL NOT NULL,
    "contractId" CHAR(42),
    "selector" CHAR(10) NOT NULL,
    "abi" JSONB NOT NULL,
    "source" "AbiSource" NOT NULL,

    CONSTRAINT "ContractFunction_pkey" PRIMARY KEY ("id")
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
    "userId" CHAR(42) NOT NULL,
    "emojis" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("commentId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_name_key" ON "Contact"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_activeId_key" ON "Policy"("activeId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_draftId_key" ON "Policy"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_accountId_name_key" ON "Policy"("accountId", "name");

-- CreateIndex
CREATE INDEX "policy_createdAt" ON "PolicyState"("accountId", "policyKey", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyState_accountId_policyKey_proposalId_key" ON "PolicyState"("accountId", "policyKey", "proposalId");

-- CreateIndex
CREATE INDEX "ContractFunction_selector_idx" ON "ContractFunction"("selector");

-- CreateIndex
CREATE UNIQUE INDEX "ContractFunction_contractId_selector_key" ON "ContractFunction"("contractId", "selector");

-- CreateIndex
CREATE INDEX "Comment_accountId_key_idx" ON "Comment"("accountId", "key");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_activeId_fkey" FOREIGN KEY ("activeId") REFERENCES "PolicyState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "PolicyState"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyState" ADD CONSTRAINT "PolicyState_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyState" ADD CONSTRAINT "PolicyState_accountId_policyKey_fkey" FOREIGN KEY ("accountId", "policyKey") REFERENCES "Policy"("accountId", "key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyState" ADD CONSTRAINT "PolicyState_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "PolicyState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "PolicyState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionReceipt" ADD CONSTRAINT "TransactionReceipt_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "TransactionReceipt"("transactionHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatedTransfer" ADD CONSTRAINT "SimulatedTransfer_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Simulation"("proposalId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractFunction" ADD CONSTRAINT "ContractFunction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
