import { prisma } from "../../database/prisma.js";

function formatarPreco(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

function obterNumeroWhatsApp() {
  const numero = process.env.WHATSAPP_NUMERO;

  if (!numero) {
    throw new Error("WHATSAPP_NUMERO_NAO_CONFIGURADO");
  }

  return numero.replace(/\D/g, "");
}

async function buscarCarrinhoAberto(usuarioId: number) {
  return prisma.carrinho.findFirst({
    where: {
      usuarioId,
      finalizado: false,
    },
    orderBy: {
      criadoEm: "desc",
    },
  });
}

async function obterOuCriarCarrinho(usuarioId: number) {
  const carrinhoExistente = await buscarCarrinhoAberto(
    usuarioId
  );

  if (carrinhoExistente) {
    return carrinhoExistente;
  }

  return prisma.carrinho.create({
    data: {
      usuarioId,
    },
  });
}

const produtoCarrinhoInclude = {
  categoria: true,
  imagens: true,
};

export async function listarCarrinho(usuarioId: number) {
  return prisma.carrinho.findFirst({
    where: {
      usuarioId,
      finalizado: false,
    },
    include: {
      itens: {
        include: {
          produtoVariacao: {
            include: {
              produto: {
                include: produtoCarrinhoInclude,
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

export async function adicionarItemCarrinho(
  usuarioId: number,
  produtoVariacaoId: number,
  quantidade: number
) {
  const variacao = await prisma.produtoVariacao.findUnique({
    where: {
      id: produtoVariacaoId,
    },
  });

  if (!variacao) {
    throw new Error("VARIACAO_NAO_ENCONTRADA");
  }

  if (!variacao.disponivel) {
    throw new Error("VARIACAO_INDISPONIVEL");
  }

  const carrinho = await obterOuCriarCarrinho(usuarioId);

  const itemExistente = await prisma.itemCarrinho.findUnique({
    where: {
      carrinhoId_produtoVariacaoId: {
        carrinhoId: carrinho.id,
        produtoVariacaoId,
      },
    },
  });

  if (itemExistente) {
    return prisma.itemCarrinho.update({
      where: {
        id: itemExistente.id,
      },
      data: {
        quantidade:
          itemExistente.quantidade + quantidade,
      },
      include: {
        produtoVariacao: {
          include: {
            produto: {
              include: produtoCarrinhoInclude,
            },
            cor: true,
            tamanho: true,
          },
        },
      },
    });
  }

  return prisma.itemCarrinho.create({
    data: {
      carrinhoId: carrinho.id,
      produtoVariacaoId,
      quantidade,
    },
    include: {
      produtoVariacao: {
        include: {
          produto: {
            include: produtoCarrinhoInclude,
          },
          cor: true,
          tamanho: true,
        },
      },
    },
  });
}

export async function atualizarQuantidadeItem(
  usuarioId: number,
  itemId: number,
  quantidade: number
) {
  const item = await prisma.itemCarrinho.findFirst({
    where: {
      id: itemId,
      carrinho: {
        usuarioId,
        finalizado: false,
      },
    },
  });

  if (!item) {
    throw new Error("ITEM_NAO_ENCONTRADO");
  }

  return prisma.itemCarrinho.update({
    where: {
      id: itemId,
    },
    data: {
      quantidade,
    },
  });
}

export async function removerItemCarrinho(
  usuarioId: number,
  itemId: number
) {
  const item = await prisma.itemCarrinho.findFirst({
    where: {
      id: itemId,
      carrinho: {
        usuarioId,
        finalizado: false,
      },
    },
  });

  if (!item) {
    throw new Error("ITEM_NAO_ENCONTRADO");
  }

  return prisma.itemCarrinho.delete({
    where: {
      id: itemId,
    },
  });
}

export async function gerarPedidoWhatsApp(
  usuarioId: number
) {
  const carrinho = await prisma.carrinho.findFirst({
    where: {
      usuarioId,
      finalizado: false,
    },
    include: {
      itens: {
        include: {
          produtoVariacao: {
            include: {
              produto: {
                include: produtoCarrinhoInclude,
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

  if (!carrinho) {
    throw new Error("CARRINHO_NAO_ENCONTRADO");
  }

  if (carrinho.itens.length === 0) {
    throw new Error("CARRINHO_VAZIO");
  }

  const itensMensagem = carrinho.itens.map(
    (item, index) => {
      const variacao = item.produtoVariacao;
      const produto = variacao.produto;

      const precoUnitario = Number(produto.preco);
      const subtotal =
        precoUnitario * item.quantidade;

      return [
        `${index + 1}. ${produto.nome}`,
        `Cor: ${variacao.cor?.nome ?? "Não informada"}`,
        `Tamanho: ${variacao.tamanho.nome}`,
        `Quantidade: ${item.quantidade}`,
        `Preço unitário: R$ ${formatarPreco(
          precoUnitario
        )}`,
        `Subtotal: R$ ${formatarPreco(subtotal)}`,
      ].join("\n");
    }
  );

  const total = carrinho.itens.reduce(
    (soma, item) => {
      const preco = Number(
        item.produtoVariacao.produto.preco
      );

      return soma + preco * item.quantidade;
    },
    0
  );

  const mensagem = [
    "Olá! Gostaria de finalizar meu pedido:",
    "",
    itensMensagem.join("\n\n"),
    "",
    `Total: R$ ${formatarPreco(total)}`,
  ].join("\n");

  const numeroWhatsApp = obterNumeroWhatsApp();

  const whatsappUrl =
    `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
      mensagem
    )}`;

  return {
    carrinhoId: carrinho.id,
    mensagem,
    whatsappUrl,
    total,
  };
}
