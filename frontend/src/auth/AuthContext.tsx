import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buscarUsuarioLogado, login as loginApi } from "../api/auth";
import type { Usuario } from "../types";
import { getToken, getUsuarioSalvo, limparSessao, salvarSessao } from "./session";

interface AuthContextValue {
  usuario: Usuario | null;
  carregandoUsuario: boolean;
  estaLogado: boolean;
  ehAdmin: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  atualizarUsuario: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => getUsuarioSalvo());
  const [carregandoUsuario, setCarregandoUsuario] = useState(true);

  async function atualizarUsuario() {
    const token = getToken();

    if (!token) {
      setUsuario(null);
      setCarregandoUsuario(false);
      return;
    }

    try {
      const usuarioAtual = await buscarUsuarioLogado();
      setUsuario(usuarioAtual);
      salvarSessao(token, usuarioAtual);
    } catch {
      limparSessao();
      setUsuario(null);
    } finally {
      setCarregandoUsuario(false);
    }
  }

  useEffect(() => {
    atualizarUsuario();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      carregandoUsuario,
      estaLogado: Boolean(usuario),
      ehAdmin: usuario?.role === "ADMIN",
      async login(email: string, senha: string) {
        const resposta = await loginApi(email, senha);
        salvarSessao(resposta.token, resposta.usuario);
        setUsuario(resposta.usuario);
      },
      logout() {
        limparSessao();
        setUsuario(null);
      },
      atualizarUsuario,
    }),
    [usuario, carregandoUsuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
