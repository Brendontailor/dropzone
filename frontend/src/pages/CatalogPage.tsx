import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarProdutos } from "../api/produtos";
import { ProductCard } from "../components/ProductCard";
import type { Produto } from "../types";

function getParametro(nome: string) {
  return new URLSearchParams(window.location.search).get(nome) ?? "";
}

export function CatalogPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState(() => getParametro("busca"));
  const [somenteDestaque, setSomenteDestaque] = useState(
    () => getParametro("destaque") === "true"
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const lista = await listarProdutos({
        busca: busca.trim() || undefined,
        disponivel: true,
        destaque: somenteDestaque || undefined,
      });

      setProdutos(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar catálogo.");
      setProdutos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  const titulo = useMemo(
    () => (somenteDestaque ? "Destaques da DropZone" : "Peças em movimento"),
    [somenteDestaque]
  );

  async function pesquisar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await carregar();
  }

  return (
    <main className="section catalog-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h1>{titulo}</h1>
        </div>

        <form className="search-form" onSubmit={pesquisar}>
          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por camiseta, moletom..."
          />
          <label className={somenteDestaque ? "check-filter active" : "check-filter"}>
            <input
              type="checkbox"
              checked={somenteDestaque}
              onChange={(event) => setSomenteDestaque(event.target.checked)}
            />
            <span aria-hidden="true" />
            Destaques
          </label>
          <button className="btn btn-primary" type="submit">
            Buscar
          </button>
        </form>
      </div>

      {carregando ? (
        <p className="status-text">Carregando produtos...</p>
      ) : erro ? (
        <p className="status-text error">{erro}</p>
      ) : produtos.length === 0 ? (
        <p className="status-text">Nenhuma peça encontrada.</p>
      ) : (
        <div className="product-grid four">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </main>
  );
}
