/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `commentId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `Comment` table. All the data in the column will be lost.
  - The primary key for the `Reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `commentId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `entityId` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the `CommentEntity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `key` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `key` to the `Reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonce` to the `Reaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_safeId_entityId_fkey";

-- DropForeignKey
ALTER TABLE "CommentEntity" DROP CONSTRAINT "CommentEntity_safeId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_safeId_entityId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_safeId_entityId_commentId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "commentId",
DROP COLUMN "entityId",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "nonce" SERIAL NOT NULL,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("safeId", "key", "nonce");

-- AlterTable
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pkey",
DROP COLUMN "commentId",
DROP COLUMN "entityId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "nonce" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Reaction_pkey" PRIMARY KEY ("safeId", "key", "nonce", "approverId");

-- DropTable
DROP TABLE "CommentEntity";

-- CreateIndex
CREATE INDEX "Comment_safeId_key_idx" ON "Comment"("safeId", "key");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_safeId_key_nonce_fkey" FOREIGN KEY ("safeId", "key", "nonce") REFERENCES "Comment"("safeId", "key", "nonce") ON DELETE CASCADE ON UPDATE CASCADE;
