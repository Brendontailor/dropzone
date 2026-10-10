import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import {
  atualizarDisponibilidadeProdutoController,
  atualizarDisponibilidadeVariacaoController,
  atualizarProdutoController,
  buscarProdutoPorIdController,
  criarProdutoController,
  criarVariacaoProdutoController,
  deletarProdutoController,
  listarProdutosController,
  listarVariacoesProdutoController,
} from "./produtos.controller.js";

export const produtosRoutes = Router();

produtosRoutes.post("/", authMiddleware, adminMiddleware, criarProdutoController);
produtosRoutes.get("/", listarProdutosController);

// Variações ficam dentro do módulo de produtos, então não precisa alterar o app.ts.
produtosRoutes.post(
  "/:produtoId/variacoes",
  authMiddleware,
  adminMiddleware,
  criarVariacaoProdutoController
);

produtosRoutes.get(
  "/:produtoId/variacoes",
  listarVariacoesProdutoController
);

produtosRoutes.patch(
  "/variacoes/:id/disponibilidade",
  authMiddleware,
  adminMiddleware,
  atualizarDisponibilidadeVariacaoController
);

produtosRoutes.get("/:id", buscarProdutoPorIdController);
produtosRoutes.put("/:id", authMiddleware, adminMiddleware, atualizarProdutoController);

produtosRoutes.patch(
  "/:id/disponibilidade",
  authMiddleware,
  adminMiddleware,
  atualizarDisponibilidadeProdutoController
);

produtosRoutes.delete("/:id", authMiddleware, adminMiddleware, deletarProdutoController);
