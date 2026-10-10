import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedUsers() {
  console.log("Iniciando seed de usuários...");

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME?.trim() || "Administrador";

  const clientEmail = process.env.CLIENT_EMAIL?.trim();
  const clientPassword = process.env.CLIENT_PASSWORD;
  const clientName = process.env.CLIENT_NAME?.trim() || "Cliente Teste";

  let created = 0;

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) {
      throw new Error("ADMIN_PASSWORD deve ter pelo menos 8 caracteres.");
    }

    const existingAdmin = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const senhaHash = await bcrypt.hash(adminPassword, 10);
      await prisma.usuario.create({
        data: {
          nome: adminName,
          email: adminEmail,
          senhaHash,
          role: "ADMIN",
        },
      });
      console.log(`Usuário administrador "${adminEmail}" criado.`);
      created++;
    } else {
      console.log(`Usuário administrador "${adminEmail}" já existe.`);
    }
  } else {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD não definidos. Admin não criado.");
  }

  if (clientEmail && clientPassword) {
    if (clientPassword.length < 8) {
      throw new Error("CLIENT_PASSWORD deve ter pelo menos 8 caracteres.");
    }

    const existingClient = await prisma.usuario.findUnique({
      where: { email: clientEmail },
    });

    if (!existingClient) {
      const senhaHash = await bcrypt.hash(clientPassword, 10);
      await prisma.usuario.create({
        data: {
          nome: clientName,
          email: clientEmail,
          senhaHash,
          role: "CLIENTE",
        },
      });
      console.log(`Usuário cliente "${clientEmail}" criado.`);
      created++;
    } else {
      console.log(`Usuário cliente "${clientEmail}" já existe.`);
    }
  } else {
    console.warn("CLIENT_EMAIL/CLIENT_PASSWORD não definidos. Cliente não criado.");
  }

  if (created === 0) {
    console.log("Nenhum usuário foi criado. Defina as variáveis de ambiente para criar usuários iniciais.");
  }

  console.log("Seed finalizado.");
}

seedUsers()
  .catch((error) => {
    console.error("Erro no seed:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });