import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import {
  atualizarVariacaoController,
  buscarVariacaoPorIdController,
  criarVariacaoController,
  deletarVariacaoController,
  listarVariacoesPorProdutoController,
} from "./variacoes.controller.js";

export const variacoesRoutes = Router();

variacoesRoutes.get("/produto/:produtoId", listarVariacoesPorProdutoController);
variacoesRoutes.get("/:id", buscarVariacaoPorIdController);
variacoesRoutes.post("/", authMiddleware, adminMiddleware, criarVariacaoController);
variacoesRoutes.put("/:id", authMiddleware, adminMiddleware, atualizarVariacaoController);
variacoesRoutes.delete("/:id", authMiddleware, adminMiddleware, deletarVariacaoController);
