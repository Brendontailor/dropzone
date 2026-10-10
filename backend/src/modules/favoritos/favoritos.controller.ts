import { Request, Response } from "express";

import {  adicionarFavorito,  listarFavoritos,  removerFavorito,} from "./favoritos.service.js";


// Adicionar favorito
export async function adicionarFavoritoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = Number(req.usuarioId);
    const produtoId = Number(req.params.produtoId);

    const favorito = await adicionarFavorito(
      usuarioId,
      produtoId
    );

    return res.status(201).json(favorito);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao adicionar favorito.",
    });
  }
}


// Listar favoritos
export async function listarFavoritosController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = Number(req.usuarioId);

    const favoritos = await listarFavoritos(usuarioId);

    return res.status(200).json(favoritos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar favoritos.",
    });
  }
}


// Remover favorito
export async function removerFavoritoController(
  req: Request,
  res: Response
) {
  try {
    const usuarioId = Number(req.usuarioId);
    const produtoId = Number(req.params.produtoId);

    const favorito = await removerFavorito(
      usuarioId,
      produtoId
    );

    return res.status(200).json({
      mensagem: "Favorito removido com sucesso.",
      favorito,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao remover favorito.",
    });
  }
}