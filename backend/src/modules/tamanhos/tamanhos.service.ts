import { prisma } from "../../database/prisma.js";

interface CriarTamanhoData {
  nome: string;
}

interface AtualizarTamanhoData {
  nome: string;
}

export async function criarTamanho(data: CriarTamanhoData) {
  return prisma.tamanho.create({
    data: { nome: data.nome },
  });
}

export async function listarTamanhos() {
  return prisma.tamanho.findMany({
    orderBy: { id: "asc" },
  });
}

export async function buscarTamanhoPorId(id: number) {
  return prisma.tamanho.findUnique({
    where: { id },
  });
}

export async function atualizarTamanho(id: number, data: AtualizarTamanhoData) {
  return prisma.tamanho.update({
    where: { id },
    data: { nome: data.nome },
  });
}

export async function deletarTamanho(id: number) {
  return prisma.tamanho.delete({
    where: { id },
  });
}
