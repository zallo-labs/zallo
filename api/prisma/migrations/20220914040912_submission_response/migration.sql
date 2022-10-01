-- CreateTable
CREATE TABLE "SubmissionResponse" (
    "hash" CHAR(66) NOT NULL,
    "response" CHAR(66) NOT NULL,
    "reverted" BOOLEAN NOT NULL DEFAULT false,
    "gasUsed" DECIMAL(19,0) NOT NULL,
    "blockNumber" DECIMAL(18,0) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubmissionResponse_pkey" PRIMARY KEY ("hash")
);

-- AddForeignKey
ALTER TABLE "SubmissionResponse" ADD CONSTRAINT "SubmissionResponse_hash_fkey" FOREIGN KEY ("hash") REFERENCES "Submission"("hash") ON DELETE CASCADE ON UPDATE CASCADE;
