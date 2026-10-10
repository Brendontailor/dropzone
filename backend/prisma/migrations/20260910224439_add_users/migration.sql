-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENTE', 'ADMIN');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CLIENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "imagemUrl" TEXT,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "categoriaId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cor" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "hex" TEXT,

    CONSTRAINT "Cor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tamanho" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Tamanho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdutoVariacao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT,
    "tamanhoId" TEXT NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProdutoVariacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorito" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "usuarioId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrinho" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "finalizado" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCarrinho" (
    "id" TEXT NOT NULL,
    "carrinhoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "corId" TEXT,
    "tamanhoId" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ItemCarrinho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nome_key" ON "Categoria"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Cor_nome_key" ON "Cor"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Tamanho_nome_key" ON "Tamanho"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoVariacao_produtoId_corId_tamanhoId_key" ON "ProdutoVariacao"("produtoId", "corId", "tamanhoId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_produtoId_key" ON "Favorito"("usuarioId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_usuarioId_produtoId_key" ON "Avaliacao"("usuarioId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCarrinho_carrinhoId_produtoId_corId_tamanhoId_key" ON "ItemCarrinho"("carrinhoId", "produtoId", "corId", "tamanhoId");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_tamanhoId_fkey" FOREIGN KEY ("tamanhoId") REFERENCES "Tamanho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorito" ADD CONSTRAINT "Favorito_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrinho" ADD CONSTRAINT "Carrinho_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCarrinho" ADD CONSTRAINT "ItemCarrinho_carrinhoId_fkey" FOREIGN KEY ("carrinhoId") REFERENCES "Carrinho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCarrinho" ADD CONSTRAINT "ItemCarrinho_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
