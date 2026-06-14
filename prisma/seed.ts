import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const accounts = [
    { email: "admin@aeroclub.de", name: "Administrator", password: "admin123", role: "ADMIN" as const },
    { email: "flug@aeroclub.de", name: "Flugbuch Tablet", password: "flug1234", role: "DISPATCHER" as const },
  ];

  for (const account of accounts) {
    const existing = await prisma.user.findUnique({ where: { email: account.email } });
    if (existing) {
      console.log(`Account '${account.email}' existiert bereits.`);
      continue;
    }
    const hashed = await bcrypt.hash(account.password, 12);
    await prisma.user.create({ data: { ...account, password: hashed } });
    console.log(`✅ ${account.role} erstellt: ${account.email} / ${account.password}`);
  }

  console.log("⚠️  Bitte Passwörter nach dem ersten Login ändern!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
