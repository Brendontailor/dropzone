import { Heart, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { listarCarrinho } from "../api/carrinho";
import { useAuth } from "../auth/AuthContext";

export function Header() {
  const { usuario, logout } = useAuth();
  const [busca, setBusca] = useState("");
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);

  async function carregarQuantidadeCarrinho() {
    if (!usuario) {
      setQuantidadeCarrinho(0);
      return;
    }

    try {
      const carrinho = await listarCarrinho();
      const quantidade = carrinho.itens.reduce(
        (total, item) => total + item.quantidade,
        0
      );
      setQuantidadeCarrinho(quantidade);
    } catch {
      setQuantidadeCarrinho(0);
    }
  }

  useEffect(() => {
    carregarQuantidadeCarrinho();

    window.addEventListener("focus", carregarQuantidadeCarrinho);
    window.addEventListener("dropzone:carrinho-atualizado", carregarQuantidadeCarrinho);

    return () => {
      window.removeEventListener("focus", carregarQuantidadeCarrinho);
      window.removeEventListener("dropzone:carrinho-atualizado", carregarQuantidadeCarrinho);
    };
  }, [usuario]);

  function buscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const termo = busca.trim();
    window.location.href = `/catalogo${termo ? `?busca=${encodeURIComponent(termo)}` : ""}`;
  }

  return (
    <>
      <header className="site-header">
        <a className="brand brand-image" href="/" aria-label="DropZone">
          <img src="/home/logo-dropzone.png" alt="DropZone" width={172} height={50} decoding="async" />
        </a>

        <nav className="nav">
          <a href="/catalogo">Catálogo</a>
          <a href="/catalogo?destaque=true">Destaques</a>
          <a href="/favoritos">Favoritos</a>
          {usuario?.role === "ADMIN" && <a href="/admin">Admin</a>}
        </nav>

        <form className="search-shell" onSubmit={buscar}>
          <Search size={18} aria-hidden="true" />
          <input
            aria-label="Buscar produtos"
            placeholder="Buscar camiseta, moletom..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
        </form>

        <div className="header-actions">
          <a className="icon-link" href="/favoritos" aria-label="Favoritos">
            <Heart size={19} />
          </a>
          <a className="icon-link cart-link" href="/carrinho" aria-label="Carrinho">
            <ShoppingBag size={19} />
            {quantidadeCarrinho > 0 && (
              <span className="cart-count">
                {quantidadeCarrinho > 99 ? "99+" : quantidadeCarrinho}
              </span>
            )}
          </a>

          {usuario ? (
            <>
              <a className="user-pill" href="/interacoes">
                {usuario.nome}
              </a>
              <button className="ghost-button" type="button" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <a className="ghost-button" href="/login">
              Entrar
            </a>
          )}
        </div>
      </header>
    </>
  );
}
