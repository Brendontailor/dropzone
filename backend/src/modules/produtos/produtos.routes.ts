import { Router } from "express";

import {
    atualizarDisponibilidadeProdutoController,
    atualizarProdutoController,
  criarProdutoController,
  deletarProdutoController,
  listarProdutosController,
} from "./produtos.controller.js";

export const produtosRoutes = Router();
///incluir produto
produtosRoutes.post("/", criarProdutoController);

//listar produto
produtosRoutes.get("/", listarProdutosController);

///editar produto existente
produtosRoutes.put("/:id", atualizarProdutoController);


// atualizar disponibilidade 
produtosRoutes.patch(  "/:id/disponibilidade", atualizarDisponibilidadeProdutoController);


//************* cuidado ************ */
///deleta do banco
produtosRoutes.delete("/:id", deletarProdutoController);