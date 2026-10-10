import { Request, Response } from "express";

import {  criarAvaliacao,  listarAvaliacoesProduto,  atualizarAvaliacao,  deletarAvaliacao,} from "./avaliacoes.service.js";


// Criar avaliação
export async function criarAvaliacaoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = Number(req.usuarioId);
    const produtoId = Number(req.params.produtoId);

    const { nota, comentario } = req.body;

    if (!Number.isInteger(produtoId)) {
      return res.status(400).json({
        mensagem: "Produto inválido.",
      });
    }

    if (typeof nota !== "number" || nota < 1 || nota > 5) {
      return res.status(400).json({
        mensagem: "A nota deve ser um número entre 1 e 5.",
      });
    }

    const avaliacao = await criarAvaliacao({
      usuarioId,
      produtoId,
      nota,
      comentario,
    });

    return res.status(201).json(avaliacao);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao criar avaliação.",
    });
  }
}


// Listar avaliações de um produto
export async function listarAvaliacoesProdutoController(
  req: Request,
  res: Response
) {
  try {
    const produtoId = Number(req.params.produtoId);

    const avaliacoes = await listarAvaliacoesProduto(produtoId);

    return res.status(200).json(avaliacoes);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar avaliações.",
    });
  }
}


// Atualizar avaliação
export async function atualizarAvaliacaoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = Number(req.usuarioId) ;
    const produtoId = Number(req.params.produtoId);

    const { nota, comentario } = req.body;

    if (typeof nota !== "number" || nota < 1 || nota > 5) {
      return res.status(400).json({
        mensagem: "A nota deve ser um número entre 1 e 5.",
      });
    }

    const avaliacao = await atualizarAvaliacao(
      usuarioId,
      produtoId,
      {
        nota,
        comentario,
      }
    );

    return res.status(200).json(avaliacao);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao atualizar avaliação.",
    });
  }
}


// Deletar avaliação
export async function deletarAvaliacaoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = Number(req.usuarioId)             ;
    const produtoId = Number(req.params.produtoId);

    const avaliacao = await deletarAvaliacao(
      usuarioId,
      produtoId
    );

    return res.status(200).json({
      mensagem: "Avaliação deletada com sucesso.",
      avaliacao,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao deletar avaliação.",
    });
  }
}