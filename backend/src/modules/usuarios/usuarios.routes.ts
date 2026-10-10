import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  criarUsuarioController,
  meuPerfilController,
  minhasInteracoesController,
} from "./usuarios.controller.js";

export const usuariosRoutes = Router();

usuariosRoutes.post("/", criarUsuarioController);

usuariosRoutes.get(
  "/me",
  authMiddleware,
  meuPerfilController
);

usuariosRoutes.get(
  "/me/interacoes",
  authMiddleware,
  minhasInteracoesController
);
