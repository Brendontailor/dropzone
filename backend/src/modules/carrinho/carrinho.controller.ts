import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  adicionarItemCarrinho,
  atualizarQuantidadeItem,
  gerarPedidoWhatsApp,
  listarCarrinho,
  removerItemCarrinho,
} from "./carrinho.service.js";

export async function listarCarrinhoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const carrinho = await listarCarrinho(usuarioId);

    if (!carrinho) {
      return res.status(404).json({
        mensagem: "Carrinho não encontrado.",
      });
    }

    return res.status(200).json(carrinho);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar carrinho.",
    });
  }
}

export async function adicionarItemCarrinhoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = req.usuarioId;
    const { produtoVariacaoId, quantidade } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    if (!Number.isInteger(Number(produtoVariacaoId))) {
      return res.status(400).json({
        mensagem: "produtoVariacaoId inválido.",
      });
    }

    if (
      !Number.isInteger(Number(quantidade)) ||
      Number(quantidade) <= 0
    ) {
      return res.status(400).json({
        mensagem: "Quantidade deve ser maior que zero.",
      });
    }

    const item = await adicionarItemCarrinho(
      usuarioId,
      Number(produtoVariacaoId),
      Number(quantidade)
    );

    return res.status(201).json(item);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "VARIACAO_NAO_ENCONTRADA"
    ) {
      return res.status(404).json({
        mensagem: "Variação do produto não encontrada.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "VARIACAO_INDISPONIVEL"
    ) {
      return res.status(400).json({
        mensagem: "Essa variação está indisponível.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao adicionar item ao carrinho.",
    });
  }
}

export async function atualizarQuantidadeItemController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = req.usuarioId;
    const itemId = Number(req.params.id);
    const { quantidade } = req.body;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({
        mensagem: "ID do item inválido.",
      });
    }

    if (
      !Number.isInteger(Number(quantidade)) ||
      Number(quantidade) <= 0
    ) {
      return res.status(400).json({
        mensagem: "Quantidade deve ser maior que zero.",
      });
    }

    const item = await atualizarQuantidadeItem(
      usuarioId,
      itemId,
      Number(quantidade)
    );

    return res.status(200).json(item);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ITEM_NAO_ENCONTRADO"
    ) {
      return res.status(404).json({
        mensagem: "Item do carrinho não encontrado.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao atualizar item do carrinho.",
    });
  }
}

export async function removerItemCarrinhoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = req.usuarioId;
    const itemId = Number(req.params.id);

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    if (!Number.isInteger(itemId)) {
      return res.status(400).json({
        mensagem: "ID do item inválido.",
      });
    }

    const item = await removerItemCarrinho(
      usuarioId,
      itemId
    );

    return res.status(200).json(item);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ITEM_NAO_ENCONTRADO"
    ) {
      return res.status(404).json({
        mensagem: "Item do carrinho não encontrado.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao remover item do carrinho.",
    });
  }
}

export async function gerarPedidoWhatsAppController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const pedido = await gerarPedidoWhatsApp(usuarioId);

    return res.status(200).json(pedido);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "CARRINHO_NAO_ENCONTRADO"
    ) {
      return res.status(404).json({
        mensagem: "Carrinho não encontrado.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "CARRINHO_VAZIO"
    ) {
      return res.status(400).json({
        mensagem: "O carrinho está vazio.",
      });
    }

    if (
      error instanceof Error &&
      error.message === "WHATSAPP_NUMERO_NAO_CONFIGURADO"
    ) {
      return res.status(500).json({
        mensagem: "Número do WhatsApp da empresa não configurado.",
      });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      console.error(error);
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao gerar pedido para o WhatsApp.",
    });
  }
}