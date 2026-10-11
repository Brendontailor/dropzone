import { prisma } from "../../database/prisma.js";
import { LOOKS_INICIAIS, NOVO_LOTE } from "./novo-lote.catalogo.js";
import { vincularProdutosAosLooksExistentes } from "./novo-lote.look-links.js";

// Reexecução segura: usa codigoLote. Nunca altera nome/preço/imagens removidas de um item já editado.
export async function importarNovoLote() {
  let produtosCriados = 0;
  let produtosExistentes = 0;
  let fotosAdicionadas = 0;
  let variacoesAdicionadas = 0;
  let looksCriados = 0;

  for (const item of NOVO_LOTE) {
    const categoria = await prisma.categoria.upsert({
      where: { nome: item.categoria }, update: {}, create: { nome: item.categoria },
    });
    let produto = await prisma.produto.findUnique({ where: { codigoLote: item.codigo } });
    if (!produto) {
      // Compatibilidade com o seed antigo, que não atribuía um código ao produto.
      const produtoLegado = await prisma.produto.findFirst({ where: { nome: item.nome, codigoLote: null } });
      if (produtoLegado) {
        produto = await prisma.produto.update({ where: { id: produtoLegado.id }, data: { codigoLote: item.codigo } });
      } else {
        produto = await prisma.produto.create({ data: {
          codigoLote: item.codigo,
          nome: item.nome,
          descricao: "Peça do Novo Lote DropZone. Consulte as medidas e confirme disponibilidade antes da compra.",
          preco: item.preco,
          categoriaId: categoria.id,
          destaque: true,
          disponivel: true,
        } });
        produtosCriados++;
      }
    }

    // Não substitui fotos nem tamanhos personalizados: acrescenta apenas entradas faltantes.
    for (const imagemUrl of item.imagens) {
      const existe = await prisma.produtoImagem.findFirst({ where: { produtoId: produto.id, imagemUrl } });
      if (!existe) {
        await prisma.produtoImagem.create({ data: { produtoId: produto.id, imagemUrl } });
        fotosAdicionadas++;
      }
    }
    for (const nome of item.tamanhos) {
      const tamanho = await prisma.tamanho.upsert({ where: { nome }, update: {}, create: { nome } });
      const variacao = await prisma.produtoVariacao.findFirst({ where: { produtoId: produto.id, tamanhoId: tamanho.id, corId: null } });
      if (!variacao) {
        await prisma.produtoVariacao.create({ data: { produtoId: produto.id, tamanhoId: tamanho.id, disponivel: true } });
        variacoesAdicionadas++;
      }
    }
  }
  produtosExistentes = NOVO_LOTE.length - produtosCriados;

  // Os seis looks originais são criados APENAS numa instalação sem nenhum look.
  // Havendo looks cadastrados, nenhum registro é recriado ou substituído.
  const existemLooks = (await prisma.look.count()) > 0;
  if (!existemLooks) {
    for (const look of LOOKS_INICIAIS) {
      const produtos = await prisma.produto.findMany({
        where: { codigoLote: { in: [...look.codigos] } },
        select: { id: true, codigoLote: true },
      });
      const porCodigo = new Map(produtos.map((produto) => [produto.codigoLote, produto.id]));
      const ids = look.codigos.map((codigo) => porCodigo.get(codigo))
        .filter((id): id is number => id !== undefined);
      await prisma.look.create({
        data: {
          codigo: look.codigo,
          nome: look.nome,
          descricao: look.descricao,
          imagemUrl: look.imagemUrl,
          ordem: look.ordem,
          publicado: true,
          itens: { create: ids.map((produtoId, ordem) => ({ produtoId, ordem })) },
        },
      });
      looksCriados++;
    }
  }

  // Para banco com looks preexistentes, preencher só os que não têm peças.
  const vinculacao = await vincularProdutosAosLooksExistentes();
  return {
    produtosCriados, produtosExistentes, fotosAdicionadas, variacoesAdicionadas,
    looksCriados, looksVinculados: vinculacao.looksVinculados,
    vinculosCriados: vinculacao.vinculosCriados,
    totalProdutos: NOVO_LOTE.length,
    totalFotos: NOVO_LOTE.reduce((n, item) => n + item.imagens.length, 0),
  };
}
