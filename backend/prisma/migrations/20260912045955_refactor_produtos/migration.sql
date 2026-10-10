/*
  Warnings:

  - The primary key for the `Avaliacao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Avaliacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Carrinho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Carrinho` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Categoria` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Categoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Cor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Cor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Favorito` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Favorito` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ItemCarrinho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `corId` on the `ItemCarrinho` table. All the data in the column will be lost.
  - You are about to drop the column `produtoId` on the `ItemCarrinho` table. All the data in the column will be lost.
  - You are about to drop the column `tamanhoId` on the `ItemCarrinho` table. All the data in the column will be lost.
  - The `id` column on the `ItemCarrinho` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Produto` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `imagemUrl` on the `Produto` table. All the data in the column will be lost.
  - The `id` column on the `Produto` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `ProdutoVariacao` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ProdutoVariacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `corId` column on the `ProdutoVariacao` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Tamanho` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Tamanho` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[carrinhoId,produtoVariacaoId]` on the table `ItemCarrinho` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `usuarioId` on the `Avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `produtoId` on the `Avaliacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `usuarioId` on the `Carrinho` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `usuarioId` on the `Favorito` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `produtoId` on the `Favorito` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `produtoVariacaoId` to the `ItemCarrinho` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `carrinhoId` on the `ItemCarrinho` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `categoriaId` on the `Produto` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `produtoId` on the `ProdutoVariacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tamanhoId` on the `ProdutoVariacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Carrinho" DROP CONSTRAINT "Carrinho_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "ItemCarrinho" DROP CONSTRAINT "ItemCarrinho_carrinhoId_fkey";

-- DropForeignKey
ALTER TABLE "ItemCarrinho" DROP CONSTRAINT "ItemCarrinho_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "ProdutoVariacao" DROP CONSTRAINT "ProdutoVariacao_corId_fkey";

-- DropForeignKey
ALTER TABLE "ProdutoVariacao" DROP CONSTRAINT "ProdutoVariacao_produtoId_fkey";

-- DropForeignKey
ALTER TABLE "ProdutoVariacao" DROP CONSTRAINT "ProdutoVariacao_tamanhoId_fkey";

-- DropIndex
DROP INDEX "ItemCarrinho_carrinhoId_produtoId_corId_tamanhoId_key";

-- AlterTable
ALTER TABLE "Avaliacao" DROP CONSTRAINT "Avaliacao_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
DROP COLUMN "produtoId",
ADD COLUMN     "produtoId" INTEGER NOT NULL,
ADD CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Carrinho" DROP CONSTRAINT "Carrinho_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
ADD CONSTRAINT "Carrinho_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Categoria" DROP CONSTRAINT "Categoria_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Cor" DROP CONSTRAINT "Cor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Cor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Favorito" DROP CONSTRAINT "Favorito_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "usuarioId",
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
DROP COLUMN "produtoId",
ADD COLUMN     "produtoId" INTEGER NOT NULL,
ADD CONSTRAINT "Favorito_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ItemCarrinho" DROP CONSTRAINT "ItemCarrinho_pkey",
DROP COLUMN "corId",
DROP COLUMN "produtoId",
DROP COLUMN "tamanhoId",
ADD COLUMN     "produtoVariacaoId" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "carrinhoId",
ADD COLUMN     "carrinhoId" INTEGER NOT NULL,
ADD CONSTRAINT "ItemCarrinho_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Produto" DROP CONSTRAINT "Produto_pkey",
DROP COLUMN "imagemUrl",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "categoriaId",
ADD COLUMN     "categoriaId" INTEGER NOT NULL,
ADD CONSTRAINT "Produto_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ProdutoVariacao" DROP CONSTRAINT "ProdutoVariacao_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "produtoId",
ADD COLUMN     "produtoId" INTEGER NOT NULL,
DROP COLUMN "corId",
ADD COLUMN     "corId" INTEGER,
DROP COLUMN "tamanhoId",
ADD COLUMN     "tamanhoId" INTEGER NOT NULL,
ADD CONSTRAINT "ProdutoVariacao_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Tamanho" DROP CONSTRAINT "Tamanho_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Tamanho_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ProdutoImagem" (
    "id" SERIAL NOT NULL,
    "imagemUrl" TEXT NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "corId" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProdutoImagem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Avaliacao_usuarioId_produtoId_key" ON "Avaliacao"("usuarioId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorito_usuarioId_produtoId_key" ON "Favorito"("usuarioId", "produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCarrinho_carrinhoId_produtoVariacaoId_key" ON "ItemCarrinho"("carrinhoId", "produtoVariacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProdutoVariacao_produtoId_corId_tamanhoId_key" ON "ProdutoVariacao"("produtoId", "corId", "tamanhoId");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoVariacao" ADD CONSTRAINT "ProdutoVariacao_tamanhoId_fkey" FOREIGN KEY ("tamanhoId") REFERENCES "Tamanho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoImagem" ADD CONSTRAINT "ProdutoImagem_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdutoImagem" ADD CONSTRAINT "ProdutoImagem_corId_fkey" FOREIGN KEY ("corId") REFERENCES "Cor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "ItemCarrinho" ADD CONSTRAINT "ItemCarrinho_produtoVariacaoId_fkey" FOREIGN KEY ("produtoVariacaoId") REFERENCES "ProdutoVariacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
