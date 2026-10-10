import { apiFetch } from "./api";
import type { Produto, ProdutoVariacao } from "../types";

export interface ProdutoFiltros {
  busca?: string;
  categoriaId?: number;
  disponivel?: boolean;
  destaque?: boolean;
}

export function listarProdutos(filtros: ProdutoFiltros = {}) {
  const params = new URLSearchParams();

  if (filtros.busca) params.set("busca", filtros.busca);
  if (filtros.categoriaId) params.set("categoriaId", String(filtros.categoriaId));
  if (filtros.disponivel !== undefined) {
    params.set("disponivel", String(filtros.disponivel));
  }
  if (filtros.destaque !== undefined) {
    params.set("destaque", String(filtros.destaque));
  }

  const query = params.toString();

  return apiFetch<Produto[]>(`/produtos${query ? `?${query}` : ""}`);
}

export function buscarProdutoPorId(id: number) {
  return apiFetch<Produto>(`/produtos/${id}`);
}

export function criarProduto(data: {
  nome: string;
  descricao: string;
  preco: number;
  categoriaId: number;
  imagemUrl?: string;
  destaque?: boolean;
}) {
  return apiFetch<Produto>("/produtos", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export function atualizarProduto(
  id: number,
  data: {
    nome: string;
    descricao: string;
    preco: number;
    categoriaId: number;
    destaque?: boolean;
  }
) {
  return apiFetch<Produto>(`/produtos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}

export function atualizarDisponibilidadeProduto(id: number, disponivel: boolean) {
  return apiFetch<Produto>(`/produtos/${id}/disponibilidade`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ disponivel }),
  });
}

export function deletarProduto(id: number) {
  return apiFetch<{ mensagem: string; produto: Produto }>(`/produtos/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function listarVariacoesProduto(produtoId: number) {
  return apiFetch<ProdutoVariacao[]>(`/produtos/${produtoId}/variacoes`);
}

export function criarVariacaoProduto(
  produtoId: number,
  data: {
    corId?: number | null;
    tamanhoId: number;
    disponivel?: boolean;
  }
) {
  return apiFetch<ProdutoVariacao>(`/produtos/${produtoId}/variacoes`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export function atualizarDisponibilidadeVariacao(id: number, disponivel: boolean) {
  return apiFetch<ProdutoVariacao>(`/produtos/variacoes/${id}/disponibilidade`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ disponivel }),
  });
}
