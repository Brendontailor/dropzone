import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import {
  dashboardAdminController,
  excluirAvaliacaoAdminController,
  listarAvaliacoesAdminController,
  listarFavoritosAdminController,
  listarPedidosAdminController,
  responderAvaliacaoController,
} from "./admin.controller.js";

export const adminRoutes = Router();

adminRoutes.use(authMiddleware, adminMiddleware);

adminRoutes.get("/dashboard", dashboardAdminController);
adminRoutes.get("/avaliacoes", listarAvaliacoesAdminController);
adminRoutes.patch(
  "/avaliacoes/:id/resposta",
  responderAvaliacaoController
);
adminRoutes.delete(
  "/avaliacoes/:id",
  excluirAvaliacaoAdminController
);
adminRoutes.get("/favoritos", listarFavoritosAdminController);
adminRoutes.get("/pedidos", listarPedidosAdminController);
