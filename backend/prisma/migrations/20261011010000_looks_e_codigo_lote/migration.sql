ALTER TABLE "Produto" ADD COLUMN "codigoLote" TEXT;
CREATE UNIQUE INDEX "Produto_codigoLote_key" ON "Produto"("codigoLote");
CREATE TABLE "Look" (
  "id" SERIAL NOT NULL,
  "codigo" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "descricao" TEXT NOT NULL DEFAULT '',
  "imagemUrl" TEXT NOT NULL,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  "publicado" BOOLEAN NOT NULL DEFAULT true,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Look_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Look_codigo_key" ON "Look"("codigo");
CREATE TABLE "LookProduto" (
  "lookId" INTEGER NOT NULL,
  "produtoId" INTEGER NOT NULL,
  "ordem" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "LookProduto_pkey" PRIMARY KEY ("lookId", "produtoId")
);
ALTER TABLE "LookProduto" ADD CONSTRAINT "LookProduto_lookId_fkey" FOREIGN KEY ("lookId") REFERENCES "Look"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LookProduto" ADD CONSTRAINT "LookProduto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "LookProduto_produtoId_idx" ON "LookProduto"("produtoId");
