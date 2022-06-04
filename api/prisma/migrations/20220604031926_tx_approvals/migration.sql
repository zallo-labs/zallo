-- CreateTable
CREATE TABLE "Approval" (
    "approverId" CHAR(42) NOT NULL,
    "safeId" CHAR(42) NOT NULL,
    "txHash" CHAR(66) NOT NULL,
    "signature" TEXT NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("safeId","txHash","approverId")
);

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "txHash") ON DELETE RESTRICT ON UPDATE CASCADE;
