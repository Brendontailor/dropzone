const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = localStorage.getItem("dropzone_token");

  const headers = new Headers(options.headers);

  if (options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const data = contentType?.includes("application/json")
    ? await response.json()
    : await response.text().catch(() => null);

  if (!response.ok) {
    const mensagem =
      typeof data === "object" && data
        ? data.mensagem ?? data.message ?? "Erro na requisição."
        : String(data || "Erro na requisição.");

    throw new Error(mensagem);
  }

  return data as T;
}
