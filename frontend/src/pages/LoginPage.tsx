import { useState, type FormEvent } from "react";
import { Eye, EyeOff, ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setEnviando(true);
    try {
      await login(email.trim(), senha);
      window.location.href = "/";
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível entrar. Confira seus dados.");
    } finally { setEnviando(false); }
  }

  return (
    <main className="dz-auth">
      <section className="dz-auth-editorial" aria-label="DropZone streetwear">
        <img src="/colecao/modelos/look-03.webp" alt="Editorial DropZone em cenário urbano" />
        <div className="dz-auth-editorial-shade" />
        <div className="dz-auth-editorial-copy">
          <span className="eyebrow">DROPZONE / STREETWEAR</span>
          <h1>VISTA A<br/>SUA ATITUDE.</h1>
          <p>Uma seleção feita para quem não passa despercebido.</p>
        </div>
      </section>
      <section className="dz-auth-panel">
        <div className="dz-auth-form-wrap">
          <span className="eyebrow">SUA CONTA</span>
          <h2>Bem-vindo de volta.</h2>
          <p className="dz-auth-lead">Entre para salvar favoritos, montar looks e acompanhar suas escolhas.</p>
          <form className="dz-auth-form" onSubmit={entrar}>
            <label htmlFor="dz-email">E-mail</label>
            <div className="dz-auth-field"><Mail size={18} aria-hidden="true"/><input id="dz-email" name="email" type="email" autoComplete="email" placeholder="seuemail@exemplo.com" value={email} onChange={e=>setEmail(e.target.value)} required /></div>
            <label htmlFor="dz-pass">Senha</label>
            <div className="dz-auth-field"><LockKeyhole size={18} aria-hidden="true"/><input id="dz-pass" name="password" type={mostrar ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={senha} onChange={e=>setSenha(e.target.value)} required /><button type="button" className="dz-pass-toggle" aria-label={mostrar?"Ocultar senha":"Mostrar senha"} aria-pressed={mostrar} onClick={()=>setMostrar(v=>!v)}>{mostrar?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>
            {erro && <p className="error" role="alert">{erro}</p>}
            <button className="btn btn-primary dz-auth-submit" disabled={enviando} type="submit">{enviando?"Entrando...":"Entrar na minha conta"} <ArrowRight size={18}/></button>
          </form>
          <p className="dz-auth-register">Ainda não tem conta? <a href="/cadastro">Criar conta</a></p>
          <a href="/" className="dz-auth-back">← Voltar para a loja</a>
        </div>
      </section>
    </main>
  );
}
