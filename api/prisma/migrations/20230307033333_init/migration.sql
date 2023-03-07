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
CREATE TABLE "Rule" (
    "accountId" CHAR(42) NOT NULL,
    "key" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "activeId" INTEGER,
    "draftId" INTEGER,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("accountId","key")
);

-- CreateTable
CREATE TABLE "RuleState" (
    "id" SERIAL NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "ruleKey" INTEGER NOT NULL,
    "proposalId" CHAR(66),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRemoved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RuleState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approver" (
    "ruleStateId" INTEGER NOT NULL,
    "userId" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("ruleStateId","userId")
);

-- CreateTable
CREATE TABLE "FunctionSelector" (
    "ruleStateId" INTEGER NOT NULL,
    "selector" CHAR(10) NOT NULL,

    CONSTRAINT "FunctionSelector_pkey" PRIMARY KEY ("ruleStateId","selector")
);

-- CreateTable
CREATE TABLE "Target" (
    "ruleStateId" INTEGER NOT NULL,
    "address" CHAR(66) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("ruleStateId","address")
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
    "accountId" CHAR(42),

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("commentId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_name_key" ON "Contact"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_activeId_key" ON "Rule"("activeId");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_draftId_key" ON "Rule"("draftId");

-- CreateIndex
CREATE INDEX "rule_createdAt" ON "RuleState"("accountId", "ruleKey", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "RuleState_accountId_ruleKey_proposalId_key" ON "RuleState"("accountId", "ruleKey", "proposalId");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");

-- CreateIndex
CREATE INDEX "Comment_accountId_key_idx" ON "Comment"("accountId", "key");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_activeId_fkey" FOREIGN KEY ("activeId") REFERENCES "RuleState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rule" ADD CONSTRAINT "Rule_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "RuleState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleState" ADD CONSTRAINT "RuleState_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleState" ADD CONSTRAINT "RuleState_accountId_ruleKey_fkey" FOREIGN KEY ("accountId", "ruleKey") REFERENCES "Rule"("accountId", "key") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RuleState" ADD CONSTRAINT "RuleState_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_ruleStateId_fkey" FOREIGN KEY ("ruleStateId") REFERENCES "RuleState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FunctionSelector" ADD CONSTRAINT "FunctionSelector_ruleStateId_fkey" FOREIGN KEY ("ruleStateId") REFERENCES "RuleState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Target" ADD CONSTRAINT "Target_ruleStateId_fkey" FOREIGN KEY ("ruleStateId") REFERENCES "RuleState"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
