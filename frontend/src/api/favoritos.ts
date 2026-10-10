import { apiFetch } from "./api";
import type { Favorito } from "../types";

export function listarFavoritos() {
  return apiFetch<Favorito[]>("/favoritos", {
    auth: true,
  });
}

export function adicionarFavorito(produtoId: number) {
  return apiFetch<Favorito>(`/favoritos/${produtoId}`, {
    method: "POST",
    auth: true,
  });
}

export function removerFavorito(produtoId: number) {
  return apiFetch<Favorito>(`/favoritos/${produtoId}`, {
    method: "DELETE",
    auth: true,
  });
}
