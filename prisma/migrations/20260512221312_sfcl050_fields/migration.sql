-- AlterTable
ALTER TABLE "Flight" ADD COLUMN     "arrivalLocation" TEXT,
ADD COLUMN     "departureLocation" TEXT,
ADD COLUMN     "instructorId" INTEGER,
ADD COLUMN     "pilotFunction" TEXT;

-- AddForeignKey
ALTER TABLE "Flight" ADD CONSTRAINT "Flight_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;
