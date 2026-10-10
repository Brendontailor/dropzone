import { Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client.js";
import { atualizarCategoria, criarCategoria, deletarCategoria, listarCategoria } from "./categorias.service.js"



//criar categoria
export async function criarCategoriaController(
  req: Request,
  res: Response
) {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({
        mensagem: "Nome é obrigatório.",
      });
    }

    const categoria = await criarCategoria({
      nome,
    });

    return res.status(201).json(categoria);

  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        mensagem: "Já existe uma categoria com esse nome.",
      });
    }

    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao criar categoria.",
    });
  }
}


//listando categoria
export async function listarCategoriaController(
  req: Request,
  res: Response
) {
  try {
    const categorias = await listarCategoria();

    return res.status(200).json(categorias);

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      mensagem: "Erro ao listar categorias.",
    });
  }
}






// atualizar categoria
export async function atualizarCategoriaController(req: Request, res: Response){
   
  try {
    const { id } = req.params;
    const { nome } = req.body; 

    if (!nome) {
      return res.status(400).json({ message: "nome é obrigatório" });
    }
    if (!id) {
      return res.status(400).json({ message: "id é obrigatório" });
    }
    const categoria = await atualizarCategoria(Number(id), { nome });
    return res.status(200).json(categoria);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao atualizar categoria." });
  } 
 }


 ///deletar categoria
export async function deletarCategoriaController(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "id é obrigatório" });
    }

    const categoria = await deletarCategoria(Number(id));
    return res.status(200).json(categoria);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao deletar categoria." });
  }
}
