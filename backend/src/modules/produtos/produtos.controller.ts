import type { Request, Response } from "express";
import { atualizarDisponibilidadeProduto, atualizarProduto, criarProduto, deletarProduto, listarProdutos } from "./produtos.service.js";

export async function criarProdutoController(  req: Request,  res: Response) 
{
  try {
    
    const {
      nome,
      descricao,
      preco,
      imagemUrl,
      categoriaId,
    } = req.body;

    if (!nome || !descricao || preco === undefined || !categoriaId) {
      return res.status(400).json({
        mensagem:
          "nome, descrição, preço e categoriaId são obrigatórios",
      });
    }

    const produto = await criarProduto({
      nome,
      descricao,
      preco: Number(preco),
      imagemUrl,
      categoriaId,
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


export async function listarProdutosController(
  _req: Request,  res: Response)

  {
  try {
    const produtos = await listarProdutos();

    return res.status(200).json(produtos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar produtos.",
    });
  }
}

export async function atualizarProdutoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    const produto = await atualizarProduto(id, req.body);

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao atualizar produto.",
    });
  }
}

// atualiza disponibilidade do produto
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

    const produto = await atualizarDisponibilidadeProduto(
      id,
      disponivel
    );

    return res.status(200).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao atualizar disponibilidade do produto.",
    });
  }
}


// deletar do banco
export async function deletarProdutoController(
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