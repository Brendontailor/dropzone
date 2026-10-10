import { prisma } from "../../database/prisma.js";

interface CriarVariacaoData {
  produtoId: number;
  corId?: number | null;
  tamanhoId: number;
  disponivel?: boolean;
}

interface AtualizarVariacaoData {
  corId?: number | null;
  tamanhoId?: number;
  disponivel?: boolean;
}

export async function criarVariacao(data: CriarVariacaoData) {
  return prisma.produtoVariacao.create({
    data: {
      produtoId: data.produtoId,
      corId: data.corId,
      tamanhoId: data.tamanhoId,
      disponivel: data.disponivel ?? true,
    },
    include: {
      produto: true,
      cor: true,
      tamanho: true,
    },
  });
}

export async function listarVariacoesPorProduto(produtoId: number) {
  return prisma.produtoVariacao.findMany({
    where: { produtoId },
    include: {
      cor: true,
      tamanho: true,
    },
    orderBy: { id: "asc" },
  });
}

export async function buscarVariacaoPorId(id: number) {
  return prisma.produtoVariacao.findUnique({
    where: { id },
    include: {
      produto: true,
      cor: true,
      tamanho: true,
    },
  });
}

export async function atualizarVariacao(
  id: number,
  data: AtualizarVariacaoData
) {
  return prisma.produtoVariacao.update({
    where: { id },
    data,
    include: {
      produto: true,
      cor: true,
      tamanho: true,
    },
  });
}

export async function deletarVariacao(id: number) {
  return prisma.produtoVariacao.delete({
    where: { id },
  });
}
