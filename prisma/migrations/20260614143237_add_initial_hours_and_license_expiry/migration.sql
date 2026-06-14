-- AlterTable
ALTER TABLE "Aircraft" ADD COLUMN     "initialHours" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "licenseExpiry" TIMESTAMP(3);
