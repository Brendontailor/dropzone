import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  atualizarCor,
  buscarCorPorId,
  criarCor,
  deletarCor,
  listarCores,
} from "./cores.service.js";

export async function criarCorController(req: Request, res: Response) {
  try {
    const { nome, hex } = req.body;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({ mensagem: "Nome da cor é obrigatório." });
    }

    const cor = await criarCor({
      nome: nome.trim(),
      hex: typeof hex === "string" && hex.trim() ? hex.trim() : undefined,
    });

    return res.status(201).json(cor);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        mensagem: "Já existe uma cor com esse nome.",
      });
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao criar cor." });
  }
}

export async function listarCoresController(req: Request, res: Response) {
  try {
    const cores = await listarCores();
    return res.status(200).json(cores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao listar cores." });
  }
}

export async function buscarCorPorIdController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da cor inválido." });
    }

    const cor = await buscarCorPorId(id);

    if (!cor) {
      return res.status(404).json({ mensagem: "Cor não encontrada." });
    }

    return res.status(200).json(cor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao buscar cor." });
  }
}

export async function atualizarCorController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { nome, hex } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da cor inválido." });
    }

    if (nome !== undefined && (typeof nome !== "string" || !nome.trim())) {
      return res.status(400).json({ mensagem: "Nome da cor inválido." });
    }

    const cor = await atualizarCor(id, {
      nome: typeof nome === "string" ? nome.trim() : undefined,
      hex:
        hex === null
          ? null
          : typeof hex === "string"
            ? hex.trim()
            : undefined,
    });

    return res.status(200).json(cor);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          mensagem: "Já existe uma cor com esse nome.",
        });
      }

      if (error.code === "P2025") {
        return res.status(404).json({ mensagem: "Cor não encontrada." });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao atualizar cor." });
  }
}

export async function deletarCorController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID da cor inválido." });
    }

    const cor = await deletarCor(id);
    return res.status(200).json(cor);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ mensagem: "Cor não encontrada." });
      }

      if (error.code === "P2003") {
        return res.status(409).json({
          mensagem: "Não é possível deletar uma cor que está sendo usada.",
        });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao deletar cor." });
  }
}
