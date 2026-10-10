import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  atualizarTamanho,
  buscarTamanhoPorId,
  criarTamanho,
  deletarTamanho,
  listarTamanhos,
} from "./tamanhos.service.js";

export async function criarTamanhoController(req: Request, res: Response) {
  try {
    const { nome } = req.body;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        mensagem: "Nome do tamanho é obrigatório.",
      });
    }

    const tamanho = await criarTamanho({ nome: nome.trim() });
    return res.status(201).json(tamanho);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        mensagem: "Já existe um tamanho com esse nome.",
      });
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao criar tamanho." });
  }
}

export async function listarTamanhosController(req: Request, res: Response) {
  try {
    const tamanhos = await listarTamanhos();
    return res.status(200).json(tamanhos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao listar tamanhos." });
  }
}

export async function buscarTamanhoPorIdController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID do tamanho inválido." });
    }

    const tamanho = await buscarTamanhoPorId(id);

    if (!tamanho) {
      return res.status(404).json({ mensagem: "Tamanho não encontrado." });
    }

    return res.status(200).json(tamanho);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao buscar tamanho." });
  }
}

export async function atualizarTamanhoController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);
    const { nome } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID do tamanho inválido." });
    }

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return res.status(400).json({
        mensagem: "Nome do tamanho é obrigatório.",
      });
    }

    const tamanho = await atualizarTamanho(id, { nome: nome.trim() });
    return res.status(200).json(tamanho);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          mensagem: "Já existe um tamanho com esse nome.",
        });
      }

      if (error.code === "P2025") {
        return res.status(404).json({ mensagem: "Tamanho não encontrado." });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao atualizar tamanho." });
  }
}

export async function deletarTamanhoController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ mensagem: "ID do tamanho inválido." });
    }

    const tamanho = await deletarTamanho(id);
    return res.status(200).json(tamanho);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ mensagem: "Tamanho não encontrado." });
      }

      if (error.code === "P2003") {
        return res.status(409).json({
          mensagem: "Não é possível deletar um tamanho que está sendo usado.",
        });
      }
    }

    console.error(error);
    return res.status(500).json({ mensagem: "Erro ao deletar tamanho." });
  }
}
