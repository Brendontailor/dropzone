import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  admin?: boolean;
}

export function ProtectedRoute({ children, admin = false }: ProtectedRouteProps) {
  const { carregandoUsuario, estaLogado, ehAdmin } = useAuth();

  if (carregandoUsuario) {
    return <main className="page-shell">Carregando sessão...</main>;
  }

  if (!estaLogado) {
    return (
      <main className="page-shell">
        <section className="empty-panel">
          <span className="eyebrow">Acesso restrito</span>
          <h1>Faça login para continuar.</h1>
          <a className="btn btn-primary" href="/login">
            Entrar
          </a>
        </section>
      </main>
    );
  }

  if (admin && !ehAdmin) {
    return (
      <main className="page-shell">
        <section className="empty-panel">
          <span className="eyebrow">Admin</span>
          <h1>Essa área é exclusiva para administradores.</h1>
          <a className="btn btn-primary" href="/">
            Voltar
          </a>
        </section>
      </main>
    );
  }

  return children;
}
