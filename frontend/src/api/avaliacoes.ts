import { apiFetch } from "./api";
import type { Avaliacao } from "../types";

export function listarAvaliacoesProduto(produtoId: number) {
  return apiFetch<Avaliacao[]>(`/avaliacoes/produtos/${produtoId}`);
}

export function criarAvaliacao(
  produtoId: number,
  data: { nota: number; comentario?: string }
) {
  return apiFetch<Avaliacao>(`/avaliacoes/produtos/${produtoId}`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}
