import { prisma } from "../../database/prisma.js";

interface CriarProdutoData {
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoriaId: number;
}

interface AtualizarProdutoData {
  nome: string;
  descricao: string;
  preco: number;
  categoriaId: number;
}


//cria produtos no banco

export async function criarProduto(data: CriarProdutoData) {
  const categoria = await prisma.categoria.findUnique({
    where: {
      id: data.categoriaId,
    },
  });

  if (!categoria) {
    return null;
  }

  const produto = await prisma.produto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      imagemUrl: data.imagemUrl,
      categoriaId: data.categoriaId,
    },
  });

  return produto;
 
}


//lista produtos no  banco em ordem asc

export async function listarProdutos() {
  const produtos = await prisma.produto.findMany({
    orderBy: {
      nome: "asc",
    },
  });

  return produtos;
}


//atualiza produtos no banco pelo id
export async function atualizarProduto(
  id: number,
  data: AtualizarProdutoData
) {
  const produto = await prisma.produto.update({
    where: {
      id: id,
    },
    data: {
      nome: data.nome,
      descricao: data.descricao,
      preco: data.preco,
      categoriaId: data.categoriaId,
    },
  });

  return produto;
}


// altera a disponibilidade do produto disponivel :true | indisponivel :false
export async function atualizarDisponibilidadeProduto(
  id: number,
  disponivel: boolean
) {
  const produto = await prisma.produto.update({
    where: {
      id,
    },
    data: {
      disponivel,
    },
  });

  return produto;
}



//deleta produtos do banco 
export async function deletarProduto(id: number) {
  const produto = await prisma.produto.delete({
    where: {
      id,
    },

  });

  return produto;
}