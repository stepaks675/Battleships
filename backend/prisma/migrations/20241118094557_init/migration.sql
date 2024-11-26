/*
  Warnings:

  - Added the required column `user1name` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2name` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "user1name" TEXT NOT NULL,
ADD COLUMN     "user2name" TEXT NOT NULL;
