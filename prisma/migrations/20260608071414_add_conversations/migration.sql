/*
  Warnings:

  - Added the required column `messages` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "messages" TEXT NOT NULL;
