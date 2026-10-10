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
