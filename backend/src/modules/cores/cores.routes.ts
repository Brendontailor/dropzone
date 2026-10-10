import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";
import {
  atualizarCorController,
  buscarCorPorIdController,
  criarCorController,
  deletarCorController,
  listarCoresController,
} from "./cores.controller.js";

export const coresRoutes = Router();

coresRoutes.get("/", listarCoresController);
coresRoutes.get("/:id", buscarCorPorIdController);
coresRoutes.post("/", authMiddleware, adminMiddleware, criarCorController);
coresRoutes.put("/:id", authMiddleware, adminMiddleware, atualizarCorController);
coresRoutes.delete("/:id", authMiddleware, adminMiddleware, deletarCorController);
