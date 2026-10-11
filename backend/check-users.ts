import { PrismaClient } from "./src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const users = await prisma.usuario.findMany();
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();