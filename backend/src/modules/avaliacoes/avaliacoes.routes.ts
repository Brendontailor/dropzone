import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  atualizarAvaliacaoController,
  criarAvaliacaoController,
  deletarAvaliacaoController,
  listarAvaliacoesProdutoController,
} from "./avaliacoes.controller.js";

export const avaliacoesRoutes = Router();

avaliacoesRoutes.get("/produtos/:produtoId", listarAvaliacoesProdutoController);

avaliacoesRoutes.post("/produtos/:produtoId", authMiddleware, criarAvaliacaoController);

avaliacoesRoutes.put("/produtos/:produtoId", authMiddleware, atualizarAvaliacaoController);

avaliacoesRoutes.delete("/produtos/:produtoId", authMiddleware, deletarAvaliacaoController);
