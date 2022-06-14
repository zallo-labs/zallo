-- CreateTable
CREATE TABLE "CommentEntity" (
    "safeId" CHAR(42) NOT NULL,
    "entityId" TEXT NOT NULL,

    CONSTRAINT "CommentEntity_pkey" PRIMARY KEY ("safeId","entityId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "safeId" CHAR(42) NOT NULL,
    "entityId" TEXT NOT NULL,
    "authorId" CHAR(42) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "commentId" INTEGER NOT NULL,
    "approverId" CHAR(42) NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("commentId","approverId")
);

-- AddForeignKey
ALTER TABLE "CommentEntity" ADD CONSTRAINT "CommentEntity_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentEntity" ADD CONSTRAINT "CommentEntity_safeId_entityId_fkey" FOREIGN KEY ("safeId", "entityId") REFERENCES "Tx"("safeId", "hash") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Approver"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_safeId_entityId_fkey" FOREIGN KEY ("safeId", "entityId") REFERENCES "CommentEntity"("safeId", "entityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
