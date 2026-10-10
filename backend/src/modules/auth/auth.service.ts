import { prisma } from "../../database/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RealizaLoginData {
  email: string;
  senha: string;
}

export async function realizarLogin(data: RealizaLoginData) {
  const usuarioExistente = await prisma.usuario.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!usuarioExistente) {
    throw new Error("Email ou senha inválidos");
  }

  const senhaCorreta = await bcrypt.compare(
    data.senha,
    usuarioExistente.senhaHash,
  );
  if (!senhaCorreta) {
    throw new Error("Email ou senha inválidos");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não configurado");
  }
  const token = jwt.sign(
    {
      sub: usuarioExistente.id,
      role: usuarioExistente.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );

  return {
    token,
    usuario: {
      id: usuarioExistente.id,
      nome: usuarioExistente.nome,
      email: usuarioExistente.email,
      role: usuarioExistente.role,
    },
  };
}
