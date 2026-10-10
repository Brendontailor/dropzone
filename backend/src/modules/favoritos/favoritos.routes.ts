import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js"; 
import { adicionarFavoritoController, listarFavoritosController, removerFavoritoController } from "./favoritos.controller.js";

export const favoritosRoutes = Router();
// Favoritar um produto
favoritosRoutes.post(  "/:produtoId",  authMiddleware,  adicionarFavoritoController);


// Listar favoritos do usuário logado
favoritosRoutes.get(  "/",  authMiddleware,  listarFavoritosController);


// Remover produto dos favoritos
favoritosRoutes.delete(  "/:produtoId",  authMiddleware,  removerFavoritoController);