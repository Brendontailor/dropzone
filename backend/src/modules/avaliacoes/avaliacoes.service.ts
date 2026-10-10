import { prisma } from "../../database/prisma.js";

interface CriarAvaliacaoData {
  usuarioId: number;
  produtoId: number;
  nota: number;
  comentario?: string;
}

interface AtualizarAvaliacaoData {
  nota: number;
  comentario?: string;
}


// Criar avaliação
export async function criarAvaliacao(data: CriarAvaliacaoData) {
  const avaliacao = await prisma.avaliacao.create({
    data: {
      usuarioId: data.usuarioId,
      produtoId: data.produtoId,
      nota: data.nota,
      comentario: data.comentario,
    },
  });

  return avaliacao;
}


// Listar avaliações de um produto
export async function listarAvaliacoesProduto(produtoId: number) {
  const avaliacoes = await prisma.avaliacao.findMany({
    where: {
      produtoId,
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });

  return avaliacoes;
}


// Atualizar avaliação do usuário
export async function atualizarAvaliacao(
  usuarioId: number,
  produtoId: number,
  data: AtualizarAvaliacaoData
) {
  const avaliacao = await prisma.avaliacao.update({
    where: {
      usuarioId_produtoId: {
        usuarioId,
        produtoId,
      },
    },
    data: {
      nota: data.nota,
      comentario: data.comentario,
    },
  });

  return avaliacao;
}


// Deletar avaliação do usuário
export async function deletarAvaliacao(
  usuarioId: number,
  produtoId: number
) {
  const avaliacao = await prisma.avaliacao.delete({
    where: {
      usuarioId_produtoId: {
        usuarioId,
        produtoId,
      },
    },
  });

  return avaliacao;
}