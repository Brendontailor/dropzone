import { Router } from "express";
// import { listarCategoria } from "./categorias.service.js";
import { criarCategoriaController, listarCategoriaController } from "./categorias.controller.js"; 

export const categoriasRoutes = Router();

categoriasRoutes.get("/", listarCategoriaController); //feito


categoriasRoutes.post("/", criarCategoriaController); // feito