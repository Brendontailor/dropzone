import { Router } from "express";
// import { listarCategoria } from "./categorias.service.js";

import { atualizarCategoriaController, criarCategoriaController, deletarCategoriaController, listarCategoriaController } from "./categorias.controller.js"
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { adminMiddleware } from "../../middlewares/admin.middleware.js";

export const categoriasRoutes = Router();

categoriasRoutes.get("/", listarCategoriaController); //feito
categoriasRoutes.post("/", authMiddleware, adminMiddleware, criarCategoriaController); // feito
categoriasRoutes.put("/:id", authMiddleware, adminMiddleware, atualizarCategoriaController); // feito
categoriasRoutes.delete("/:id", authMiddleware, adminMiddleware, deletarCategoriaController); ///feito 