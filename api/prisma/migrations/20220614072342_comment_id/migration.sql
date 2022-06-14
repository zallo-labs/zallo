/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Like` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_entityId_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("safeId", "entityId", "commentId");

-- AlterTable
ALTER TABLE "Like" DROP CONSTRAINT "Like_pkey",
ADD CONSTRAINT "Like_pkey" PRIMARY KEY ("safeId", "entityId", "commentId", "approverId");

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_safeId_entityId_commentId_fkey" FOREIGN KEY ("safeId", "entityId", "commentId") REFERENCES "Comment"("safeId", "entityId", "commentId") ON DELETE CASCADE ON UPDATE CASCADE;
