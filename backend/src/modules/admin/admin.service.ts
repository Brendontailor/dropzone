import { prisma } from "../../database/prisma.js";

const LIMITE_RANKING = 5;

export async function buscarDadosDashboard() {
  const [
    totalProdutos,
    totalClientes,
    totalAvaliacoes,
    totalFavoritos,
    totalPedidosFinalizados,
    favoritosAgrupados,
    avaliacoesAgrupadas,
  ] = await Promise.all([
    prisma.produto.count(),
    prisma.usuario.count({
      where: { role: "CLIENTE" },
    }),
    prisma.avaliacao.count(),
    prisma.favorito.count(),
    prisma.carrinho.count({
      where: { finalizado: true },
    }),
    prisma.favorito.groupBy({
      by: ["produtoId"],
      _count: { produtoId: true },
      orderBy: {
        _count: { produtoId: "desc" },
      },
      take: LIMITE_RANKING,
    }),
    prisma.avaliacao.groupBy({
      by: ["produtoId"],
      _avg: { nota: true },
      _count: { nota: true },
      orderBy: {
        _avg: { nota: "desc" },
      },
      take: LIMITE_RANKING,
    }),
  ]);

  const idsProdutos = [
    ...new Set([
      ...favoritosAgrupados.map((item) => item.produtoId),
      ...avaliacoesAgrupadas.map((item) => item.produtoId),
    ]),
  ];

  const produtos = idsProdutos.length
    ? await prisma.produto.findMany({
        where: {
          id: { in: idsProdutos },
        },
        select: {
          id: true,
          nome: true,
          imagens: {
            take: 1,
            select: {
              imagemUrl: true,
            },
          },
        },
      })
    : [];

  const produtosPorId = new Map(
    produtos.map((produto) => [produto.id, produto])
  );

  const produtosMaisFavoritados = favoritosAgrupados
    .map((item) => {
      const produto = produtosPorId.get(item.produtoId);

      if (!produto) {
        return null;
      }

      return {
        id: produto.id,
        nome: produto.nome,
        imagemUrl: produto.imagens[0]?.imagemUrl ?? null,
        totalFavoritos: item._count.produtoId,
      };
    })
    .filter((item) => item !== null);

  const produtosMelhorAvaliados = avaliacoesAgrupadas
    .map((item) => {
      const produto = produtosPorId.get(item.produtoId);

      if (!produto) {
        return null;
      }

      return {
        id: produto.id,
        nome: produto.nome,
        imagemUrl: produto.imagens[0]?.imagemUrl ?? null,
        mediaAvaliacao: item._avg.nota ?? 0,
        totalAvaliacoes: item._count.nota,
      };
    })
    .filter((item) => item !== null);

  return {
    totais: {
      produtos: totalProdutos,
      clientes: totalClientes,
      avaliacoes: totalAvaliacoes,
      favoritos: totalFavoritos,
      pedidosFinalizados: totalPedidosFinalizados,
    },
    produtosMaisFavoritados,
    produtosMelhorAvaliados,
  };
}

export async function listarAvaliacoesAdmin() {
  return prisma.avaliacao.findMany({
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      produto: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}

export async function responderAvaliacao(
  avaliacaoId: number,
  respostaAdmin: string
) {
  return prisma.avaliacao.update({
    where: {
      id: avaliacaoId,
    },
    data: {
      respostaAdmin,
    },
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
        },
      },
      produto: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
  });
}

export async function excluirAvaliacaoAdmin(avaliacaoId: number) {
  return prisma.avaliacao.delete({
    where: {
      id: avaliacaoId,
    },
  });
}

export async function listarFavoritosAdmin() {
  return prisma.favorito.findMany({
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      produto: {
        select: {
          id: true,
          nome: true,
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}

export async function listarPedidosAdmin() {
  return prisma.carrinho.findMany({
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      itens: {
        include: {
          produtoVariacao: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  preco: true,
                },
              },
              cor: true,
              tamanho: true,
            },
          },
        },
      },
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}
