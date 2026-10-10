import { useState, type FormEvent } from "react";
import { cadastrarUsuario } from "../api/auth";

export function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function cadastrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await cadastrarUsuario({ nome, email, senha });
      setSucesso("Conta criada com sucesso. Agora faça login.");
      setNome("");
      setEmail("");
      setSenha("");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar conta.");
    }
  }

  return (
    <main className="section login-section">
      <div>
        <span className="eyebrow">Cadastro</span>
        <h1>Criar conta DropZone</h1>
        <p>
          O cadastro cria cliente no backend. Depois o login guarda os dados
          necessários para o restante do frontend.
        </p>
      </div>

      <form className="login-card" onSubmit={cadastrar}>
        <label>
          Nome
          <input value={nome} onChange={(event) => setNome(event.target.value)} />
        </label>

        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label>
          Senha
          <input value={senha} onChange={(event) => setSenha(event.target.value)} type="password" />
        </label>

        {erro && <p className="error">{erro}</p>}
        {sucesso && <p className="success">{sucesso}</p>}

        <button className="button" type="submit">
          Cadastrar
        </button>

        <a className="auth-link" href="/login">
          Já tenho conta
        </a>
      </form>
    </main>
  );
}
