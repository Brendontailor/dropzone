import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  buscarDadosDashboard,
  excluirAvaliacaoAdmin,
  listarAvaliacoesAdmin,
  listarFavoritosAdmin,
  listarPedidosAdmin,
  responderAvaliacao,
} from "./admin.service.js";

export async function dashboardAdminController(
  req: Request,
  res: Response
) {
  try {
    const dashboard = await buscarDadosDashboard();

    return res.status(200).json(dashboard);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao carregar dashboard.",
    });
  }
}

export async function listarAvaliacoesAdminController(
  req: Request,
  res: Response
) {
  try {
    const avaliacoes = await listarAvaliacoesAdmin();

    return res.status(200).json(avaliacoes);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar avaliações.",
    });
  }
}

export async function responderAvaliacaoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { respostaAdmin } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        mensagem: "ID da avaliação inválido.",
      });
    }

    if (
      typeof respostaAdmin !== "string" ||
      !respostaAdmin.trim()
    ) {
      return res.status(400).json({
        mensagem: "A resposta do administrador é obrigatória.",
      });
    }

    const avaliacao = await responderAvaliacao(
      id,
      respostaAdmin.trim()
    );

    return res.status(200).json(avaliacao);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        mensagem: "Avaliação não encontrada.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao responder avaliação.",
    });
  }
}

export async function excluirAvaliacaoAdminController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        mensagem: "ID da avaliação inválido.",
      });
    }

    const avaliacao = await excluirAvaliacaoAdmin(id);

    return res.status(200).json(avaliacao);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({
        mensagem: "Avaliação não encontrada.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao excluir avaliação.",
    });
  }
}

export async function listarFavoritosAdminController(
  req: Request,
  res: Response
) {
  try {
    const favoritos = await listarFavoritosAdmin();

    return res.status(200).json(favoritos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar favoritos.",
    });
  }
}

export async function listarPedidosAdminController(
  req: Request,
  res: Response
) {
  try {
    const pedidos = await listarPedidosAdmin();

    return res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar pedidos.",
    });
  }
}
