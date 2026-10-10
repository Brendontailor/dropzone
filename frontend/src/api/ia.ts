import { apiFetch } from "./api";
import type { SugestaoIA } from "../types";

export function sugerirLook(produtoId: number) {
  return apiFetch<SugestaoIA>("/ia/sugestao-look", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ produtoId }),
  });
}
