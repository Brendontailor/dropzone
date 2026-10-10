import { apiFetch } from "./api";
import type { Carrinho, ItemCarrinho, PedidoWhatsapp } from "../types";

export function listarCarrinho() {
  return apiFetch<Carrinho>("/carrinho", {
    auth: true,
  });
}

export function adicionarItemCarrinho(produtoVariacaoId: number, quantidade: number) {
  return apiFetch<ItemCarrinho>("/carrinho/itens", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ produtoVariacaoId, quantidade }),
  });
}

export function atualizarQuantidadeItemCarrinho(itemId: number, quantidade: number) {
  return apiFetch<ItemCarrinho>(`/carrinho/itens/${itemId}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ quantidade }),
  });
}

export function removerItemCarrinho(itemId: number) {
  return apiFetch<ItemCarrinho>(`/carrinho/itens/${itemId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function gerarPedidoWhatsapp() {
  return apiFetch<PedidoWhatsapp>("/carrinho/whatsapp", {
    method: "POST",
    auth: true,
  });
}
