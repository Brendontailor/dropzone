import { prisma } from "../../database/prisma.js"

    type criarCategoriaDTO = {
        nome: string;
    }



    type atualizarCategoriaDTO = {
        nome: string;
    }






    //criar
export async function criarCategoria(data: criarCategoriaDTO){

    const categoria = await prisma.categoria.create({
        data: {
            nome: data.nome,
        },
    })

    return categoria
}


//listar
export async function listarCategoria(){
    return prisma.categoria.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}


//atualizar
export async function atualizarCategoria(id: number, data: atualizarCategoriaDTO) 
{
    const categoria = await prisma.categoria.update({
        where: {
            id: id,
        },
        data: {
            nome: data.nome,
        },
    })
    return categoria
}


///deletar
export async function deletarCategoria(id: number) {
    const categoria = await prisma.categoria.delete({
        where: {
            id: id,
        },
    })
    return categoria
}