import { prisma } from "../../database/prisma.js"

    type criarCategoriaDTO = {
        nome: string;
    }

export async function criarCategoria(data: criarCategoriaDTO){

    const categoria = await prisma.categoria.create({
        data: {
            nome: data.nome,
        },
    })

    return categoria
}

export async function listarCategoria(){
    return prisma.categoria.findMany({
    orderBy: {
      nome: "asc",
    },
  });
}
