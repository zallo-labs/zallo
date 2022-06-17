/*
  Warnings:

  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_approverId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_safeId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_safeId_entityId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_safeId_entityId_commentId_fkey";

-- DropTable
DROP TABLE "Like";

-- CreateTable
CREATE TABLE "Reaction" (
    "commentId" INTEGER NOT NULL,
    "safeId" CHAR(42) NOT NULL,
    "entityId" TEXT NOT NULL,
    "approverId" CHAR(42) NOT NULL,
    "reaction" TEXT NOT NULL,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("safeId","entityId","commentId","approverId")
);

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "Approver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_entityId_fkey" FOREIGN KEY ("safeId", "entityId") REFERENCES "CommentEntity"("safeId", "entityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_entityId_commentId_fkey" FOREIGN KEY ("safeId", "entityId", "commentId") REFERENCES "Comment"("safeId", "entityId", "commentId") ON DELETE CASCADE ON UPDATE CASCADE;
