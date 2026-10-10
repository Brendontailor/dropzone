import { apiFetch } from "./api";
import type { Categoria, Cor, Tamanho } from "../types";

export function listarCategorias() {
  return apiFetch<Categoria[]>("/categorias");
}

export function criarCategoria(nome: string) {
  return apiFetch<Categoria>("/categorias", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ nome }),
  });
}

export function atualizarCategoria(id: number, nome: string) {
  return apiFetch<Categoria>(`/categorias/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ nome }),
  });
}

export function deletarCategoria(id: number) {
  return apiFetch<Categoria>(`/categorias/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function listarCores() {
  return apiFetch<Cor[]>("/cores");
}

export function criarCor(data: { nome: string; hex?: string }) {
  return apiFetch<Cor>("/cores", {
    method: "POST",
    auth: true,
    body: JSON.stringify(data),
  });
}

export function atualizarCor(id: number, data: { nome: string; hex?: string }) {
  return apiFetch<Cor>(`/cores/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(data),
  });
}

export function deletarCor(id: number) {
  return apiFetch<Cor>(`/cores/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function listarTamanhos() {
  return apiFetch<Tamanho[]>("/tamanhos");
}

export function criarTamanho(nome: string) {
  return apiFetch<Tamanho>("/tamanhos", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ nome }),
  });
}

export function atualizarTamanho(id: number, nome: string) {
  return apiFetch<Tamanho>(`/tamanhos/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ nome }),
  });
}

export function deletarTamanho(id: number) {
  return apiFetch<Tamanho>(`/tamanhos/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
