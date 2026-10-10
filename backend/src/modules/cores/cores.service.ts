import { prisma } from "../../database/prisma.js";

interface CriarCorData {
  nome: string;
  hex?: string;
}

interface AtualizarCorData {
  nome?: string;
  hex?: string | null;
}

export async function criarCor(data: CriarCorData) {
  return prisma.cor.create({
    data: {
      nome: data.nome,
      hex: data.hex,
    },
  });
}

export async function listarCores() {
  return prisma.cor.findMany({
    orderBy: { nome: "asc" },
  });
}

export async function buscarCorPorId(id: number) {
  return prisma.cor.findUnique({
    where: { id },
  });
}

export async function atualizarCor(id: number, data: AtualizarCorData) {
  return prisma.cor.update({
    where: { id },
    data,
  });
}

export async function deletarCor(id: number) {
  return prisma.cor.delete({
    where: { id },
  });
}
