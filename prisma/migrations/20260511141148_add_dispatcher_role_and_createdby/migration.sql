-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DISPATCHER';

-- AlterTable
ALTER TABLE "Flight" ADD COLUMN     "createdById" INTEGER;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
