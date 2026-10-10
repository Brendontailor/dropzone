import { prisma } from "../../database/prisma.js";

interface CriarProdutoData {
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoriaId: number;
  destaque?: boolean;
}

interface AtualizarProdutoData {
  nome: string;
  descricao: string;
  preco: number;
  categoriaId: number;
  destaque?: boolean;
}

interface ListarProdutosFiltros {
  busca?: string;
  categoriaId?: number;
  disponivel?: boolean;
  destaque?: boolean;
}

interface CriarVariacaoData {
  produtoId: number;
  corId?: number | null;
  tamanhoId: number;
  disponivel?: boolean;
}

const produtoInclude = {
  categoria: true,
  imagens: true,
  variacoes: {
    include: {
      cor: true,
      tamanho: true,
    },
  },
  avaliacoes: {
    select: {
      nota: true,
    },
  },
};

function adicionarMediaAvaliacoes<T extends { avaliacoes?: { nota: number }[] }>(
  produto: T
) {
  const avaliacoes = produto.avaliacoes ?? [];
  const totalAvaliacoes = avaliacoes.length;

  const mediaAvaliacoes =
    totalAvaliacoes === 0
      ? 0
      : avaliacoes.reduce((soma, avaliacao) => soma + avaliacao.nota, 0) /
        totalAvaliacoes;

  return {
    ...produto,
    mediaAvaliacoes,
    totalAvaliacoes,
  };
}

export async function criarProduto(data: CriarProdutoData) {
  const categoria = await prisma.categoria.findUnique({
    where: {
      id: data.categoriaId,
    },
  });

  if (!categoria) {
    return null;
  }

  const produto = await prisma.produto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      categoriaId: data.categoriaId,
      destaque: data.destaque ?? false,
      imagens: data.imagemUrl
        ? {
            create: {
              imagemUrl: data.imagemUrl,
            },
          }
        : undefined,
    },
    include: produtoInclude,
  });

  return adicionarMediaAvaliacoes(produto);
}

export async function listarProdutos(filtros: ListarProdutosFiltros = {}) {
  const produtos = await prisma.produto.findMany({
    where: {
      nome: filtros.busca
        ? {
            contains: filtros.busca,
            mode: "insensitive",
          }
        : undefined,
      categoriaId: filtros.categoriaId,
      disponivel: filtros.disponivel,
      destaque: filtros.destaque,
    },
    orderBy: {
      nome: "asc",
    },
    include: produtoInclude,
  });

  return produtos.map(adicionarMediaAvaliacoes);
}

export async function buscarProdutoPorId(id: number) {
  const produto = await prisma.produto.findUnique({
    where: {
      id,
    },
    include: produtoInclude,
  });

  return produto;
}

export async function atualizarProduto(
  id: number,
  data: AtualizarProdutoData
) {
  const produto = await prisma.produto.update({
    where: {
      id,
    },
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      categoriaId: data.categoriaId,
      destaque: data.destaque,
    },
    include: produtoInclude,
  });

  return produto ? adicionarMediaAvaliacoes(produto) : null;
}

export async function atualizarDisponibilidadeProduto(
  id: number,
  disponivel: boolean
) {
  const produto = await prisma.produto.update({
    where: {
      id,
    },
    data: {
      disponivel,
    },
    include: produtoInclude,
  });

  return adicionarMediaAvaliacoes(produto);
}

export async function deletarProduto(id: number) {
  const produto = await prisma.produto.delete({
    where: {
      id,
    },
  });

  return produto;
}

// Cria uma combinação de produto + cor + tamanho.
export async function criarVariacaoProduto(data: CriarVariacaoData) {
  return prisma.produtoVariacao.create({
    data: {
      produtoId: data.produtoId,
      corId: data.corId ?? null,
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

// Lista todas as variações de um produto já com cor e tamanho.
export async function listarVariacoesProduto(produtoId: number) {
  return prisma.produtoVariacao.findMany({
    where: {
      produtoId,
    },
    include: {
      produto: true,
      cor: true,
      tamanho: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}

// Permite ao admin ativar ou desativar somente uma variação.
export async function atualizarDisponibilidadeVariacao(
  id: number,
  disponivel: boolean
) {
  return prisma.produtoVariacao.update({
    where: {
      id,
    },
    data: {
      disponivel,
    },
    include: {
      produto: true,
      cor: true,
      tamanho: true,
    },
  });
}
