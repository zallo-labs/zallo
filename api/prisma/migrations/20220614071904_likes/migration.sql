/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `entityId` to the `Like` table without a default value. This is not possible if the table is not empty.
  - Added the required column `safeId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "id",
ADD COLUMN     "commentId" SERIAL NOT NULL,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("entityId", "commentId");

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "likeId" SERIAL NOT NULL,
ADD COLUMN     "safeId" CHAR(42) NOT NULL;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_safeId_fkey" FOREIGN KEY ("safeId") REFERENCES "Safe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_safeId_entityId_fkey" FOREIGN KEY ("safeId", "entityId") REFERENCES "CommentEntity"("safeId", "entityId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_entityId_commentId_fkey" FOREIGN KEY ("entityId", "commentId") REFERENCES "Comment"("entityId", "commentId") ON DELETE CASCADE ON UPDATE CASCADE;
