-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(42) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "deploySalt" CHAR(66),
    "impl" CHAR(42),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "accountId" CHAR(42) NOT NULL,
    "ref" CHAR(10) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createProposalHash" CHAR(66),
    "removeProposalHash" CHAR(66),

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("accountId","ref")
);

-- CreateTable
CREATE TABLE "Quorum" (
    "accountId" CHAR(42) NOT NULL,
    "walletRef" CHAR(10) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "createProposalHash" CHAR(66),
    "removeProposalHash" CHAR(66),

    CONSTRAINT "Quorum_pkey" PRIMARY KEY ("accountId","walletRef","hash")
);

-- CreateTable
CREATE TABLE "Approver" (
    "accountId" CHAR(42) NOT NULL,
    "walletRef" CHAR(10) NOT NULL,
    "quorumHash" CHAR(66) NOT NULL,
    "userId" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("accountId","walletRef","quorumHash","userId")
);

-- CreateTable
CREATE TABLE "Contact" (
    "userId" CHAR(42) NOT NULL,
    "addr" CHAR(42) NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("userId","addr")
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
    "accountId" CHAR(42) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "salt" CHAR(18) NOT NULL,
    "walletRef" CHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tx_pkey" PRIMARY KEY ("accountId","hash")
);

-- CreateTable
CREATE TABLE "Submission" (
    "hash" CHAR(66) NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nonce" INTEGER NOT NULL,
    "gasLimit" DECIMAL(19,0) NOT NULL,
    "gasPrice" DECIMAL(19,0),
    "finalized" BOOLEAN NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Approval" (
    "userId" CHAR(42) NOT NULL,
    "accountId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("accountId","txHash","userId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "accountId" CHAR(42) NOT NULL,
    "key" TEXT NOT NULL,
    "nonce" SERIAL NOT NULL,
    "authorId" CHAR(42) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("accountId","key","nonce")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "accountId" CHAR(42) NOT NULL,
    "key" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "userId" CHAR(42) NOT NULL,
    "emojis" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("accountId","key","nonce","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_accountId_createProposalHash_key" ON "Wallet"("accountId", "createProposalHash");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_accountId_removeProposalHash_key" ON "Wallet"("accountId", "removeProposalHash");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_name_key" ON "Contact"("userId", "name");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");

-- CreateIndex
CREATE INDEX "Comment_accountId_key_idx" ON "Comment"("accountId", "key");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_accountId_createProposalHash_fkey" FOREIGN KEY ("accountId", "createProposalHash") REFERENCES "Tx"("accountId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_accountId_removeProposalHash_fkey" FOREIGN KEY ("accountId", "removeProposalHash") REFERENCES "Tx"("accountId", "hash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_accountId_walletRef_fkey" FOREIGN KEY ("accountId", "walletRef") REFERENCES "Wallet"("accountId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_accountId_createProposalHash_fkey" FOREIGN KEY ("accountId", "createProposalHash") REFERENCES "Tx"("accountId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_accountId_removeProposalHash_fkey" FOREIGN KEY ("accountId", "removeProposalHash") REFERENCES "Tx"("accountId", "hash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_accountId_walletRef_fkey" FOREIGN KEY ("accountId", "walletRef") REFERENCES "Wallet"("accountId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_accountId_walletRef_quorumHash_fkey" FOREIGN KEY ("accountId", "walletRef", "quorumHash") REFERENCES "Quorum"("accountId", "walletRef", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_accountId_walletRef_fkey" FOREIGN KEY ("accountId", "walletRef") REFERENCES "Wallet"("accountId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_accountId_txHash_fkey" FOREIGN KEY ("accountId", "txHash") REFERENCES "Tx"("accountId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_accountId_txHash_fkey" FOREIGN KEY ("accountId", "txHash") REFERENCES "Tx"("accountId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_accountId_key_nonce_fkey" FOREIGN KEY ("accountId", "key", "nonce") REFERENCES "Comment"("accountId", "key", "nonce") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
