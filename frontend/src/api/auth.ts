import { apiFetch } from "./api";
import type { InteracoesUsuario, LoginResponse, Usuario } from "../types";

export function login(email: string, senha: string) {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function cadastrarUsuario(data: {
  nome: string;
  email: string;
  senha: string;
}) {
  return apiFetch<Usuario>("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function buscarUsuarioLogado() {
  return apiFetch<Usuario>("/usuarios/me", {
    auth: true,
  });
}

export function buscarMinhasInteracoes() {
  return apiFetch<InteracoesUsuario>("/usuarios/me/interacoes", {
    auth: true,
  });
}
