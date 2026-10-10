import { Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client.js";
import {
  buscarInteracoesUsuario,
  buscarUsuarioPorId,
  criarUsuario,
} from "./usuarios.service.js";

export async function criarUsuarioController(req: Request, res: Response) {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: "nome, email e senha são obrigatórios.",
      });
    }

    if (String(senha).length < 6) {
      return res.status(400).json({
        mensagem: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    const usuario = await criarUsuario({
      nome: String(nome).trim(),
      email: String(email).trim().toLowerCase(),
      senha: String(senha),
    });

    return res.status(201).json(usuario);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        mensagem: "Já existe um usuário com esse email.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao cadastrar usuário.",
    });
  }
}

export async function meuPerfilController(req: Request, res: Response) {
  try {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      return res.status(401).json({
        mensagem: "Usuário não autenticado.",
      });
    }

    const usuario = await buscarUsuarioPorId(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado.",
      });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao buscar usuário logado.",
    });
  }
}

export async function minhasInteracoesController(
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

    const interacoes = await buscarInteracoesUsuario(usuarioId);

    return res.status(200).json(interacoes);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao buscar interações do usuário.",
    });
  }
}
