import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  adicionarItemCarrinhoController,
  atualizarQuantidadeItemController,
  gerarPedidoWhatsAppController,
  listarCarrinhoController,
  removerItemCarrinhoController,
} from "./carrinho.controller.js";

export const carrinhoRoutes = Router();

carrinhoRoutes.get(
  "/",
  authMiddleware,
  listarCarrinhoController
);

carrinhoRoutes.post(
  "/itens",
  authMiddleware,
  adicionarItemCarrinhoController
);

carrinhoRoutes.patch(
  "/itens/:id",
  authMiddleware,
  atualizarQuantidadeItemController
);

carrinhoRoutes.delete(
  "/itens/:id",
  authMiddleware,
  removerItemCarrinhoController
);

carrinhoRoutes.post(
  "/whatsapp",
  authMiddleware,
  gerarPedidoWhatsAppController
);