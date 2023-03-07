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
CREATE TABLE "PolicyRules" (
    "id" BIGSERIAL NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "policyKey" BIGINT NOT NULL,
    "proposalId" CHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,
    "onlyFunctions" CHAR(10)[],
    "onlyTargets" CHAR(66)[],

    CONSTRAINT "PolicyRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approver" (
    "policyRulesId" BIGINT NOT NULL,
    "userId" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("policyRulesId","userId")
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" CHAR(66) NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "proposerId" CHAR(42) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" TEXT,
    "data" TEXT,
    "nonce" INTEGER NOT NULL,
    "gasLimit" DECIMAL(19,0),
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
    "userId" CHAR(42) NOT NULL,
    "signature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("proposalId","userId")
);

-- CreateTable
CREATE TABLE "ContractMethod" (
    "contract" CHAR(42) NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    "sighash" CHAR(10) NOT NULL,
    "fragment" JSONB NOT NULL,

    CONSTRAINT "ContractMethod_pkey" PRIMARY KEY ("contract","sighash")
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
CREATE INDEX "policy_createdAt" ON "PolicyRules"("accountId", "policyKey", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "PolicyRules_accountId_policyKey_proposalId_key" ON "PolicyRules"("accountId", "policyKey", "proposalId");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");

-- CreateIndex
CREATE INDEX "Comment_accountId_key_idx" ON "Comment"("accountId", "key");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_activeId_fkey" FOREIGN KEY ("activeId") REFERENCES "PolicyRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "PolicyRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRules" ADD CONSTRAINT "PolicyRules_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRules" ADD CONSTRAINT "PolicyRules_accountId_policyKey_fkey" FOREIGN KEY ("accountId", "policyKey") REFERENCES "Policy"("accountId", "key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRules" ADD CONSTRAINT "PolicyRules_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_policyRulesId_fkey" FOREIGN KEY ("policyRulesId") REFERENCES "PolicyRules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransactionResponse" ADD CONSTRAINT "TransactionResponse_transactionHash_fkey" FOREIGN KEY ("transactionHash") REFERENCES "Transaction"("hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
