/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nonce` on the `Comment` table. All the data in the column will be lost.
  - The primary key for the `Reaction` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `key` on the `Reaction` table. All the data in the column will be lost.
  - You are about to drop the column `nonce` on the `Reaction` table. All the data in the column will be lost.
  - Added the required column `id` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commentId` to the `Reaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_accountId_key_nonce_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_pkey",
DROP COLUMN "nonce",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Comment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_pkey",
DROP COLUMN "key",
DROP COLUMN "nonce",
ADD COLUMN     "commentId" INTEGER NOT NULL,
ALTER COLUMN "accountId" DROP NOT NULL,
ADD CONSTRAINT "Reaction_pkey" PRIMARY KEY ("commentId", "deviceId");

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
