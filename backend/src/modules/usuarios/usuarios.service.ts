import bcrypt from "bcrypt";
import { prisma } from "../../database/prisma.js";

interface CriarUsuarioData {
  nome: string;
  email: string;
  senha: string;
}

export async function criarUsuario(data: CriarUsuarioData) {
  const senhaHash = await bcrypt.hash(data.senha, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      senhaHash,
      role: "CLIENTE",
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
    },
  });

  return usuario;
}

export async function buscarUsuarioPorId(usuarioId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      role: true,
    },
  });

  return usuario;
}

export async function buscarInteracoesUsuario(usuarioId: number) {
  const [favoritos, avaliacoes, carrinhos] = await Promise.all([
    prisma.favorito.findMany({
      where: {
        usuarioId,
      },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
            preco: true,
            disponivel: true,
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    }),

    prisma.avaliacao.findMany({
      where: {
        usuarioId,
      },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    }),

    prisma.carrinho.findMany({
      where: {
        usuarioId,
      },
      include: {
        itens: {
          include: {
            produtoVariacao: {
              include: {
                produto: {
                  select: {
                    id: true,
                    nome: true,
                    preco: true,
                  },
                },
                cor: true,
                tamanho: true,
              },
            },
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    }),
  ]);

  return {
    favoritos,
    avaliacoes,
    carrinhos,
  };
}
