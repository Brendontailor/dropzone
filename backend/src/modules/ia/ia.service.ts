import { GoogleGenAI } from "@google/genai";
import { prisma } from "../../database/prisma.js";

const MODELOS_GEMINI = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL]
  : [
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-2.5-flash",
    ];
const LIMITE_PRODUTOS_CATALOGO = 20;

interface SugestaoLook {
  produtoBase: {
    id: number;
    nome: string;
  };
  explicacao: string;
  sugestoes: Array<{
    produtoId: number;
    nome: string;
    motivo: string;
  }>;
  geradoPorIA: true;
  fonte: "Google Gemini";
}

function criarClienteGemini() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada");
  }

  return new GoogleGenAI({ apiKey });
}

export async function gerarSugestaoLook(
  produtoId: number
): Promise<SugestaoLook> {
  const produtoBase = await prisma.produto.findUnique({
    where: {
      id: produtoId,
    },
    include: {
      categoria: true,
      imagens: true,
      variacoes: {
        include: {
          cor: true,
          tamanho: true,
        },
      },
    },
  });

  if (!produtoBase) {
    throw new Error("PRODUTO_NAO_ENCONTRADO");
  }

  const produtosDisponiveis = await prisma.produto.findMany({
    where: {
      disponivel: true,
      id: {
        not: produtoId,
      },
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      preco: true,
      categoria: {
        select: {
          nome: true,
        },
      },
      variacoes: {
        where: {
          disponivel: true,
        },
        select: {
          cor: {
            select: {
              nome: true,
            },
          },
          tamanho: {
            select: {
              nome: true,
            },
          },
        },
      },
    },
    take: LIMITE_PRODUTOS_CATALOGO,
  });

  const catalogo = produtosDisponiveis.map((produto) => ({
    id: produto.id,
    nome: produto.nome,
    descricao: produto.descricao,
    preco: produto.preco.toString(),
    categoria: produto.categoria.nome,
    cores: [
      ...new Set(
        produto.variacoes
          .map((variacao) => variacao.cor?.nome)
          .filter((cor): cor is string => Boolean(cor))
      ),
    ],
    tamanhos: [
      ...new Set(
        produto.variacoes.map((variacao) => variacao.tamanho.nome)
      ),
    ],
  }));

  const prompt = `
Você é um assistente de moda de uma loja de roupas.

Produto base:
${JSON.stringify({
  id: produtoBase.id,
  nome: produtoBase.nome,
  descricao: produtoBase.descricao,
  categoria: produtoBase.categoria.nome,
})}

Catálogo disponível:
${JSON.stringify(catalogo)}

Sugira no máximo 3 produtos do catálogo que combinem com o produto base.

Regras:
- Use somente produtos presentes no catálogo.
- Nunca invente IDs ou produtos.
- Não sugira o próprio produto base.
- Explique de forma curta por que cada peça combina.
- Se não houver boas opções, retorne uma lista vazia.
`;

  const ai = criarClienteGemini();
  let textoResposta = "";
  let ultimoErro: unknown = null;

  for (const modelo of MODELOS_GEMINI) {
    try {
      const response = await ai.models.generateContent({
        model: modelo,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              explicacao: {
                type: "string",
              },
              sugestoes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    produtoId: {
                      type: "integer",
                    },
                    nome: {
                      type: "string",
                    },
                    motivo: {
                      type: "string",
                    },
                  },
                  required: ["produtoId", "nome", "motivo"],
                },
              },
            },
            required: ["explicacao", "sugestoes"],
          },
        },
      });

      if (response.text) {
        textoResposta = response.text;
        break;
      }

      ultimoErro = new Error("RESPOSTA_IA_VAZIA");
    } catch (error) {
      ultimoErro = error;
      console.error(`Erro ao chamar modelo ${modelo}:`, error);
    }
  }

  if (!textoResposta) {
    throw ultimoErro instanceof Error
      ? ultimoErro
      : new Error("RESPOSTA_IA_VAZIA");
  }

  const respostaIA = JSON.parse(textoResposta) as {
    explicacao: string;
    sugestoes: Array<{
      produtoId: number;
      nome: string;
      motivo: string;
    }>;
  };

  const idsValidos = new Set(
    produtosDisponiveis.map((produto) => produto.id)
  );

  const sugestoesValidas = respostaIA.sugestoes
    .filter((sugestao) => idsValidos.has(sugestao.produtoId))
    .slice(0, 3);

  return {
    produtoBase: {
      id: produtoBase.id,
      nome: produtoBase.nome,
    },
    explicacao: respostaIA.explicacao,
    sugestoes: sugestoesValidas,
    geradoPorIA: true,
    fonte: "Google Gemini",
  };
}
