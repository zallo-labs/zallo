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
    "name" TEXT NOT NULL DEFAULT '',
    "deploySalt" CHAR(66),
    "impl" CHAR(42),

    CONSTRAINT "Safe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "safeId" CHAR(42) NOT NULL,
    "ref" CHAR(10) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Account_pkey" PRIMARY KEY ("safeId","ref")
);

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(42) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quorum" (
    "safeId" CHAR(42) NOT NULL,
    "accountRef" CHAR(10) NOT NULL,
    "hash" CHAR(66) NOT NULL,

    CONSTRAINT "Quorum_pkey" PRIMARY KEY ("safeId","accountRef","hash")
);

-- CreateTable
CREATE TABLE "Approver" (
    "safeId" CHAR(42) NOT NULL,
    "accountRef" CHAR(10) NOT NULL,
    "quorumHash" CHAR(66) NOT NULL,
    "userId" CHAR(42) NOT NULL,

    CONSTRAINT "Approver_pkey" PRIMARY KEY ("safeId","accountRef","quorumHash","userId")
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
    "safeId" CHAR(42) NOT NULL,
    "hash" CHAR(66) NOT NULL,
    "to" CHAR(42) NOT NULL,
    "value" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "salt" CHAR(18) NOT NULL,
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
    "gasLimit" DECIMAL(19,0) NOT NULL,
    "gasPrice" DECIMAL(19,0),
    "finalized" BOOLEAN NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Approval" (
    "userId" CHAR(42) NOT NULL,
    "safeId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("safeId","txHash","userId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "safeId" CHAR(42) NOT NULL,
    "key" TEXT NOT NULL,
    "nonce" SERIAL NOT NULL,
    "authorId" CHAR(42) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("safeId","key","nonce")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "safeId" CHAR(42) NOT NULL,
    "key" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "userId" CHAR(42) NOT NULL,
    "emojis" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("safeId","key","nonce","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_sid_key" ON "Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_userId_name_key" ON "Contact"("userId", "name");

-- CreateIndex
CREATE INDEX "ContractMethod_sighash_idx" ON "ContractMethod"("sighash");

-- CreateIndex
CREATE INDEX "Comment_safeId_key_idx" ON "Comment"("safeId", "key");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quorum" ADD CONSTRAINT "Quorum_safeId_accountRef_fkey" FOREIGN KEY ("safeId", "accountRef") REFERENCES "Account"("safeId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_safeId_accountRef_fkey" FOREIGN KEY ("safeId", "accountRef") REFERENCES "Account"("safeId", "ref") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_safeId_accountRef_quorumHash_fkey" FOREIGN KEY ("safeId", "accountRef", "quorumHash") REFERENCES "Quorum"("safeId", "accountRef", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approver" ADD CONSTRAINT "Approver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tx" ADD CONSTRAINT "Tx_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_key_nonce_fkey" FOREIGN KEY ("safeId", "key", "nonce") REFERENCES "Comment"("safeId", "key", "nonce") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
