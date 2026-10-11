import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./database/prisma.js";
import { importarNovoLote } from "./modules/admin/novo-lote.import.js";
import { vincularProdutosAosLooksExistentes } from "./modules/admin/novo-lote.look-links.js";

const PORT = process.env.PORT ?? 3333;

async function iniciarServidor() {
  try {
    // Registro efetivo no PostgreSQL antes de liberar a vitrine.
    // O importador é idempotente por codigoLote e não sobrescreve
    // produtos/looks já personalizados no painel administrativo.
    const codigoImportacao = "DZ-NOVO-LOTE-20261010";
    const importacaoConcluida = await prisma.catalogoImportacao.findUnique({
      where: { codigo: codigoImportacao },
    });
    if (!importacaoConcluida) {
      const resultado = await importarNovoLote();
      await prisma.catalogoImportacao.create({ data: { codigo: codigoImportacao } });
      console.log(
        `[DropZone] Novo Lote cadastrado: ${resultado.produtosCriados} novos produtos, ` +
        `${resultado.produtosExistentes} existentes; ${resultado.fotosAdicionadas} fotos ` +
        `e ${resultado.variacoesAdicionadas} variações criadas. ` +
        `Total: ${resultado.totalProdutos} produtos e ${resultado.totalFotos} fotos.`
      );
    } else {
      console.log("[DropZone] Novo Lote já cadastrado. Edições do administrador preservadas.");
    }
    // V4 já pode ter cadastrado os produtos e marcado a importação como concluída,
    // deixando looks anteriores sem vínculos. Corrigir uma vez, sem trocar os looks.
    const codigoVinculacao = "DZ-VINCULOS-LOOKS-ORIGINAIS-20261011";
    const vinculosJaVerificados = await prisma.catalogoImportacao.findUnique({
      where: { codigo: codigoVinculacao },
    });
    if (!vinculosJaVerificados) {
      const resultado = await vincularProdutosAosLooksExistentes();
      // Se faltar algum produto referenciado, permitir tentar novamente na próxima inicialização.
      if (resultado.looksEncontrados > 0 && resultado.looksSemProdutos === 0) {
        await prisma.catalogoImportacao.create({ data: { codigo: codigoVinculacao } });
      }
      console.log(
        `[DropZone] Looks preservados: ${resultado.looksEncontrados} identificados, ` +
        `${resultado.looksVinculados} looks vinculados, ${resultado.vinculosCriados} relações criadas, ` +
        `${resultado.looksPreservados} com seleção anterior mantida.`
      );
    }
    app.listen(PORT, () => {
      console.log(`DropZone API rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error(
      "[DropZone] O catálogo não pôde ser inicializado. Confira DATABASE_URL e migrações Prisma.",
      error
    );
    process.exitCode = 1;
    await prisma.$disconnect();
  }
}

void iniciarServidor();
