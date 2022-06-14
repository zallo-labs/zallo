-- DropForeignKey
ALTER TABLE "CommentEntity" DROP CONSTRAINT "CommentEntity_safeId_fkey";

-- DropForeignKey
ALTER TABLE "CommentEntity" DROP CONSTRAINT "CommentEntity_safeId_entityId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_safeId_entityId_fkey";

-- AddForeignKey
ALTER TABLE "CommentEntity" ADD CONSTRAINT "CommentEntity_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_entityId_fkey" FOREIGN KEY ("safeId", "entityId") REFERENCES "CommentEntity"("safeId", "entityId") ON DELETE CASCADE ON UPDATE CASCADE;
