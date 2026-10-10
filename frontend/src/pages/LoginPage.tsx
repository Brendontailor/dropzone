import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("cliente@dropzone.com");
  const [senha, setSenha] = useState("123456");
  const [erro, setErro] = useState("");

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    try {
      await login(email, senha);
      window.location.href = "/";
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao fazer login.");
    }
  }

  return (
    <main className="section login-section">
      <div>
        <span className="eyebrow">Conta</span>
        <h1>Entrar na área do cliente</h1>
        <p>
          A sessão salva token, id, nome, email e role para liberar páginas do
          cliente e proteger a área administrativa.
        </p>
      </div>

      <form className="login-card" onSubmit={entrar}>
        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label>
          Senha
          <input value={senha} onChange={(event) => setSenha(event.target.value)} type="password" />
        </label>

        {erro && <p className="error">{erro}</p>}

        <button className="button" type="submit">
          Entrar
        </button>

        <a className="auth-link" href="/cadastro">
          Criar conta
        </a>
      </form>
    </main>
  );
}
