import type { Produto } from "../types";

const imagensPorCategoria = [
  { termos: ["camiseta", "cropped"], imagem: "/home/categoria-camisetas.webp" },
  { termos: ["moletom"], imagem: "/home/categoria-moletons.webp" },
  { termos: ["calça", "calca", "baggy"], imagem: "/home/categoria-calcas.webp" },
  { termos: ["bermuda"], imagem: "/home/categoria-bermudas.webp" },
  { termos: ["jaqueta"], imagem: "/home/categoria-jaquetas.webp" },
  { termos: ["boné", "bone"], imagem: "/home/categoria-bones.webp" },
  { termos: ["tênis", "tenis"], imagem: "/home/categoria-tenis.webp" },
  { termos: ["acessório", "acessorio", "cinto", "carteira"], imagem: "/home/categoria-acessorios.webp" },
];

const fallbackProdutos = [
  "/home/produto-demo-01.webp",
  "/home/produto-demo-02.webp",
  "/home/produto-demo-03.webp",
  "/home/produto-demo-04.webp",
  "/home/produto-demo-05.webp",
  "/home/produto-demo-06.webp",
  "/home/produto-demo-07.webp",
  "/home/produto-demo-08.webp",
];

export function escolherImagemFallback(produto: Produto | null) {
  if (!produto) return "/home/categoria-colecoes.webp";

  const texto = `${produto.nome} ${produto.categoria?.nome ?? ""}`.toLowerCase();
  const match = imagensPorCategoria.find((item) =>
    item.termos.some((termo) => texto.includes(termo))
  );

  if (match) return match.imagem;

  return fallbackProdutos[produto.id % fallbackProdutos.length];
}

export function obterImagemProduto(produto: Produto | null) {
  return produto?.imagens?.[0]?.imagemUrl || escolherImagemFallback(produto);
}
