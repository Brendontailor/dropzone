import type { Usuario } from "../types";

const TOKEN_KEY = "dropzone_token";
const USER_KEY = "dropzone_usuario";
const USER_ID_KEY = "dropzone_usuario_id";

export function salvarSessao(token: string, usuario: Usuario) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(usuario));
  localStorage.setItem(USER_ID_KEY, String(usuario.id));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUsuarioSalvo(): Usuario | null {
  const valor = localStorage.getItem(USER_KEY);

  if (!valor) return null;

  try {
    return JSON.parse(valor) as Usuario;
  } catch {
    return null;
  }
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(USER_ID_KEY);
}
