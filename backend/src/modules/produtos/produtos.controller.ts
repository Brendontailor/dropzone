import type { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  atualizarDisponibilidadeProduto,
  atualizarDisponibilidadeVariacao,
  atualizarProduto,
  buscarProdutoPorId,
  criarProduto,
  criarVariacaoProduto,
  deletarProduto,
  listarProdutos,
  listarVariacoesProduto,
} from "./produtos.service.js";

export async function criarProdutoController(req: Request, res: Response) {
  try {
    const { nome, descricao, preco, imagemUrl, categoriaId, destaque } = req.body;

    if (!nome || !descricao || preco === undefined || !categoriaId) {
      return res.status(400).json({
        mensagem: "nome, descrição, preço e categoriaId são obrigatórios",
      });
    }

    const produto = await criarProduto({
      nome,
      descricao,
      preco: Number(preco),
      imagemUrl,
      categoriaId: Number(categoriaId),
      destaque: Boolean(destaque),
    });

    if (!produto) {
      return res.status(404).json({
        mensagem: "Categoria não encontrada.",
      });
    }

    return res.status(201).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao criar produto.",
    });
  }
}

export async function listarProdutosController(req: Request, res: Response) {
  try {
    const busca =
      typeof req.query.busca === "string" && req.query.busca.trim()
        ? req.query.busca.trim()
        : undefined;

    const categoriaId =
      typeof req.query.categoriaId === "string"
        ? Number(req.query.categoriaId)
        : undefined;

    const disponivel =
      req.query.disponivel === undefined
        ? undefined
        : req.query.disponivel === "true";

    const destaque =
      req.query.destaque === undefined
        ? undefined
        : req.query.destaque === "true";

    if (categoriaId !== undefined && !Number.isInteger(categoriaId)) {
      return res.status(400).json({
        mensagem: "categoriaId inválido.",
      });
    }

    const produtos = await listarProdutos({
      busca,
      categoriaId,
      disponivel,
      destaque,
    });

    return res.status(200).json(produtos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar produtos.",
    });
  }
}

export async function buscarProdutoPorIdController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const produto = await buscarProdutoPorId(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: "Produto não encontrado.",
      });
    }

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao buscar produto.",
    });
  }
}

export async function atualizarProdutoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const produto = await atualizarProduto(id, {
      nome: req.body.nome,
      descricao: req.body.descricao,
      preco: Number(req.body.preco),
      categoriaId: Number(req.body.categoriaId),
      destaque:
        req.body.destaque === undefined ? undefined : Boolean(req.body.destaque),
    });

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao atualizar produto.",
    });
  }
}

export async function atualizarDisponibilidadeProdutoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { disponivel } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    if (typeof disponivel !== "boolean") {
      return res.status(400).json({
        mensagem: "O campo disponivel deve ser true ou false.",
      });
    }

    const produto = await atualizarDisponibilidadeProduto(id, disponivel);

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao atualizar disponibilidade do produto.",
    });
  }
}

export async function deletarProdutoController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        mensagem: "ID inválido.",
      });
    }

    const produto = await deletarProduto(id);

    return res.status(200).json({
      mensagem: "Produto deletado com sucesso.",
      produto,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao deletar produto.",
    });
  }
}

// Cria uma nova variação para o produto informado na URL.
export async function criarVariacaoProdutoController(
  req: Request,
  res: Response
) {
  try {
    const produtoId = Number(req.params.produtoId);
    const { corId, tamanhoId, disponivel } = req.body;

    if (!Number.isInteger(produtoId)) {
      return res.status(400).json({ mensagem: "ID do produto inválido." });
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
      return res.status(400).json({ mensagem: "corId inválido." });
    }

    if (disponivel !== undefined && typeof disponivel !== "boolean") {
      return res.status(400).json({
        mensagem: "disponivel deve ser true ou false.",
      });
    }

    const variacao = await criarVariacaoProduto({
      produtoId,
      corId: corId === undefined || corId === null ? null : Number(corId),
      tamanhoId: Number(tamanhoId),
      disponivel,
    });

    return res.status(201).json(variacao);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          mensagem: "Essa combinação de produto, cor e tamanho já existe.",
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

export async function listarVariacoesProdutoController(
  req: Request,
  res: Response
) {
  try {
    const produtoId = Number(req.params.produtoId);

    if (!Number.isInteger(produtoId)) {
      return res.status(400).json({ mensagem: "ID do produto inválido." });
    }

    const variacoes = await listarVariacoesProduto(produtoId);
    return res.status(200).json(variacoes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao listar variações." });
  }
}

// Altera apenas a disponibilidade da variação, mantendo cor e tamanho.
export async function atualizarDisponibilidadeVariacaoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { disponivel } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da variação inválido." });
    }

    if (typeof disponivel !== "boolean") {
      return res.status(400).json({
        mensagem: "O campo disponivel deve ser true ou false.",
      });
    }

    const variacao = await atualizarDisponibilidadeVariacao(id, disponivel);
    return res.status(200).json(variacao);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ mensagem: "Variação não encontrada." });
    }

    console.error(error);
    return res.status(500).json({
      mensagem: "Erro ao atualizar disponibilidade da variação.",
    });
  }
}
