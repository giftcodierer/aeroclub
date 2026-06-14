/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('AKTIV', 'INAKTIV');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "email" TEXT,
ADD COLUMN     "status" "MemberStatus" DEFAULT 'AKTIV';

-- CreateIndex
CREATE UNIQUE INDEX "Member_email_key" ON "Member"("email");
