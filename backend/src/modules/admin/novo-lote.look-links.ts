import { prisma } from "../../database/prisma.js";
import { LOOKS_INICIAIS } from "./novo-lote.catalogo.js";

/**
 * Liga o catálogo aos seis looks já existentes, sem alterar nome, foto, ordem,
 * descrição, publicação ou vínculos escolhidos no painel pelo administrador.
 *
 * A correspondência prioritária é pelo código original, com fallback pela foto
 * ou nome para evitar duplicar registros legados.
 *
 * Esta rotina NÃO cria looks nem produtos. Só preenche looks sem itens.
 */
export async function vincularProdutosAosLooksExistentes() {
  const looksExistentes = await prisma.look.findMany({
    select: {
      id: true,
      codigo: true,
      nome: true,
      imagemUrl: true,
      itens: { select: { produtoId: true } },
    },
  });

  if (!looksExistentes.length) {
    return { looksEncontrados: 0, looksVinculados: 0, vinculosCriados: 0, looksPreservados: 0, looksSemProdutos: 0 };
  }

  const codigos = [...new Set(LOOKS_INICIAIS.flatMap((look) => [...look.codigos]))];
  const produtos = await prisma.produto.findMany({
    where: { codigoLote: { in: codigos } },
    select: { id: true, codigoLote: true },
  });
  const produtoPorCodigo = new Map(produtos.map((produto) => [produto.codigoLote, produto.id]));

  let looksVinculados = 0;
  let vinculosCriados = 0;
  let looksPreservados = 0;
  let looksSemProdutos = 0;
  let looksEncontrados = 0;
  const usados = new Set<number>();

  for (const modeloOriginal of LOOKS_INICIAIS) {
    // Nunca reaproveite uma linha de look para dois modelos diferentes.
    const escolherUnico = (candidatos: typeof looksExistentes) =>
      candidatos.length === 1 ? candidatos[0] : undefined;

    const existente =
      escolherUnico(looksExistentes.filter((look) => look.codigo === modeloOriginal.codigo)) ??
      escolherUnico(looksExistentes.filter((look) => look.imagemUrl === modeloOriginal.imagemUrl)) ??
      escolherUnico(looksExistentes.filter((look) => look.nome === modeloOriginal.nome));

    if (!existente || usados.has(existente.id)) continue;
    usados.add(existente.id);
    looksEncontrados++;

    // Se o look já tem itens, eles são uma escolha do painel: não sobrescrever.
    if (existente.itens.length > 0) {
      looksPreservados++;
      continue;
    }

    // Mapeamento exato das fotos originais do V2 para produtos do Novo Lote.
    const ids = modeloOriginal.codigos
      .map((codigo) => produtoPorCodigo.get(codigo))
      .filter((id): id is number => id !== undefined);

    // Nunca grave uma lista vazia nem associe itens de outro look.
    if (ids.length !== modeloOriginal.codigos.length) {
      looksSemProdutos++;
      continue;
    }

    // A chave composta (lookId, produtoId) impede duplicações se rodar de novo.
    const resultado = await prisma.lookProduto.createMany({
      data: ids.map((produtoId, ordem) => ({ lookId: existente.id, produtoId, ordem })),
      skipDuplicates: true,
    });
    if (resultado.count) {
      looksVinculados++;
      vinculosCriados += resultado.count;
    }
  }

  return { looksEncontrados, looksVinculados, vinculosCriados, looksPreservados, looksSemProdutos };
}
