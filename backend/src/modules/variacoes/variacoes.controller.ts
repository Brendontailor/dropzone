import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  atualizarVariacao,
  buscarVariacaoPorId,
  criarVariacao,
  deletarVariacao,
  listarVariacoesPorProduto,
} from "./variacoes.service.js";

export async function criarVariacaoController(req: Request, res: Response) {
  try {
    const { produtoId, corId, tamanhoId, disponivel } = req.body;

    if (!Number.isInteger(Number(produtoId))) {
      return res.status(400).json({
        mensagem: "produtoId é obrigatório e deve ser um número inteiro.",
      });
    }

    if (!Number.isInteger(Number(tamanhoId))) {
      return res.status(400).json({
        mensagem: "tamanhoId é obrigatório e deve ser um número inteiro.",
      });
    }

    if (
      corId !== undefined &&
      corId !== null &&
      !Number.isInteger(Number(corId))
    ) {
      return res.status(400).json({
        mensagem: "corId deve ser um número inteiro.",
      });
    }

    if (disponivel !== undefined && typeof disponivel !== "boolean") {
      return res.status(400).json({
        mensagem: "disponivel deve ser true ou false.",
      });
    }

    const variacao = await criarVariacao({
      produtoId: Number(produtoId),
      corId:
        corId === undefined || corId === null
          ? null
          : Number(corId),
      tamanhoId: Number(tamanhoId),
      disponivel,
    });

    return res.status(201).json(variacao);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          mensagem: "Essa variação já existe para o produto.",
        });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          mensagem: "Produto, cor ou tamanho informado não existe.",
        });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao criar variação." });
  }
}

export async function listarVariacoesPorProdutoController(
  req: Request,
  res: Response
) {
  try {
    const produtoId = Number(req.params.produtoId);

    if (!Number.isInteger(produtoId)) {
      return res.status(400).json({ mensagem: "ID do produto inválido." });
    }

    const variacoes = await listarVariacoesPorProduto(produtoId);
    return res.status(200).json(variacoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao listar variações." });
  }
}

export async function buscarVariacaoPorIdController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da variação inválido." });
    }

    const variacao = await buscarVariacaoPorId(id);

    if (!variacao) {
      return res.status(404).json({ mensagem: "Variação não encontrada." });
    }

    return res.status(200).json(variacao);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao buscar variação." });
  }
}

export async function atualizarVariacaoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { corId, tamanhoId, disponivel } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da variação inválido." });
    }

    if (
      corId !== undefined &&
      corId !== null &&
      !Number.isInteger(Number(corId))
    ) {
      return res.status(400).json({ mensagem: "corId inválido." });
    }

    if (
      tamanhoId !== undefined &&
      !Number.isInteger(Number(tamanhoId))
    ) {
      return res.status(400).json({ mensagem: "tamanhoId inválido." });
    }

    if (disponivel !== undefined && typeof disponivel !== "boolean") {
      return res.status(400).json({
        mensagem: "disponivel deve ser true ou false.",
      });
    }

    const variacao = await atualizarVariacao(id, {
      corId:
        corId === undefined
          ? undefined
          : corId === null
            ? null
            : Number(corId),
      tamanhoId:
        tamanhoId === undefined
          ? undefined
          : Number(tamanhoId),
      disponivel,
    });

    return res.status(200).json(variacao);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          mensagem: "Essa variação já existe para o produto.",
        });
      }

      if (error.code === "P2003") {
        return res.status(400).json({
          mensagem: "Cor ou tamanho informado não existe.",
        });
      }

      if (error.code === "P2025") {
        return res.status(404).json({
          mensagem: "Variação não encontrada.",
        });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao atualizar variação." });
  }
}

export async function deletarVariacaoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da variação inválido." });
    }

    const variacao = await deletarVariacao(id);
    return res.status(200).json(variacao);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({
          mensagem: "Variação não encontrada.",
        });
      }

      if (error.code === "P2003") {
        return res.status(409).json({
          mensagem: "Não é possível deletar uma variação que está sendo usada.",
        });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao deletar variação." });
  }
}
