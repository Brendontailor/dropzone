import { apiFetch } from "./api";
import type { Look } from "../types";

export interface LookPayload {
  nome: string;
  descricao: string;
  imagemUrl: string;
  ordem: number;
  publicado: boolean;
  produtoIds: number[];
}

export const listarLooks = () => apiFetch<Look[]>("/looks");
export const listarLooksAdmin = () => apiFetch<Look[]>("/looks/admin", { auth: true });
export const criarLook = (data: LookPayload) => apiFetch<Look>("/looks", { method: "POST", auth: true, body: JSON.stringify(data) });
export const atualizarLook = (id: number, data: LookPayload) => apiFetch<Look>(`/looks/${id}`, { method: "PUT", auth: true, body: JSON.stringify(data) });
export const excluirLook = (id: number) => apiFetch<{mensagem: string}>(`/looks/${id}`, { method: "DELETE", auth: true });
export const importarNovoLote = () => apiFetch<{ produtosCriados: number; produtosExistentes: number; fotosAdicionadas: number; variacoesAdicionadas: number; looksCriados: number; totalProdutos: number; totalFotos: number }>("/admin/importar-novo-lote", { method: "POST", auth: true });

export function imagemLookUrl(url: string) {
  if (url.startsWith("/uploads/")) return `${import.meta.env.VITE_API_URL ?? "http://localhost:3333"}${url}`;
  return url;
}
