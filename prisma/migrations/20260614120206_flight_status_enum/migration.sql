/*
  Warnings:

  - The `status` column on the `Flight` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FlightStatus" AS ENUM ('QUEUED', 'ACTIVE', 'COMPLETED');

-- AlterTable
ALTER TABLE "Flight" DROP COLUMN "status",
ADD COLUMN     "status" "FlightStatus" NOT NULL DEFAULT 'QUEUED';
