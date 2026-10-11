import { apiFetch } from "./api";
import type { Avaliacao, Carrinho, DashboardAdmin, Favorito } from "../types";

export function buscarDashboardAdmin() {
  return apiFetch<DashboardAdmin>("/admin/dashboard", {
    auth: true,
  });
}

export function listarAvaliacoesAdmin() {
  return apiFetch<Avaliacao[]>("/admin/avaliacoes", {
    auth: true,
  });
}

export function responderAvaliacaoAdmin(id: number, respostaAdmin: string) {
  return apiFetch<Avaliacao>(`/admin/avaliacoes/${id}/resposta`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ respostaAdmin }),
  });
}

export function excluirAvaliacaoAdmin(id: number) {
  return apiFetch<Avaliacao>(`/admin/avaliacoes/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function listarFavoritosAdmin() {
  return apiFetch<Favorito[]>("/admin/favoritos", {
    auth: true,
  });
}

export function listarPedidosAdmin() {
  return apiFetch<Carrinho[]>("/admin/pedidos", {
    auth: true,
  });
}

export function uploadImagemProduto(file: File) {
  const formData = new FormData();
  formData.append("imagem", file);

  return apiFetch<{ url: string }>("/upload/produto", {
    method: "POST",
    auth: true,
    body: formData,
    headers: {},
  });
}

export function deletarImagemProduto(url: string) {
  return apiFetch<{ mensagem: string }>("/upload/produto", {
    method: "DELETE",
    auth: true,
    body: JSON.stringify({ url }),
  });
}
