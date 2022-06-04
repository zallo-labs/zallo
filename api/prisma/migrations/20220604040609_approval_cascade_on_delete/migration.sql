-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_safeId_fkey";

-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_safeId_txHash_fkey";

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_safeId_txHash_fkey" FOREIGN KEY ("safeId", "txHash") REFERENCES "Tx"("safeId", "txHash") ON DELETE CASCADE ON UPDATE CASCADE;
