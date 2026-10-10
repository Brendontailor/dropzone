import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import {
  atualizarTamanhoController,
  buscarTamanhoPorIdController,
  criarTamanhoController,
  deletarTamanhoController,
  listarTamanhosController,
} from "./tamanhos.controller.js";

export const tamanhosRoutes = Router();

tamanhosRoutes.get("/", listarTamanhosController);
tamanhosRoutes.get("/:id", buscarTamanhoPorIdController);
tamanhosRoutes.post("/", authMiddleware, adminMiddleware, criarTamanhoController);
tamanhosRoutes.put("/:id", authMiddleware, adminMiddleware, atualizarTamanhoController);
tamanhosRoutes.delete("/:id", authMiddleware, adminMiddleware, deletarTamanhoController);
