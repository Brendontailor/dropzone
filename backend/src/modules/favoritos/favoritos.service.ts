import { prisma } from "../../database/prisma.js";

const produtoFavoritoInclude = {
  categoria: true,
  imagens: true,
  variacoes: {
    include: {
      cor: true,
      tamanho: true,
    },
  },
};

// Adicionar produto aos favoritos
export async function adicionarFavorito(  usuarioId: number,  produtoId: number) 
{
  const favorito = await prisma.favorito.create({
    data: {
      usuarioId,
      produtoId,
    },
  });

  return favorito;
}


// Listar favoritos do usuário
export async function listarFavoritos(usuarioId: number) {
  const favoritos = await prisma.favorito.findMany({
    where: {
      usuarioId,
    },
    include: {
      produto: {
        include: produtoFavoritoInclude,
      },
    },
  });

  return favoritos;
}


// Remover produto dos favoritos
export async function removerFavorito(
  usuarioId: number,
  produtoId: number
) {
  const favorito = await prisma.favorito.delete({
    where: {
      usuarioId_produtoId: {
        usuarioId,
        produtoId,
      },
    },
  });

  return favorito;
}
