import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarProdutos } from "../api/produtos";
import { ProductCard } from "../components/ProductCard";
import type { Produto } from "../types";

function getParametro(nome: string) {
  return new URLSearchParams(window.location.search).get(nome) ?? "";
}

const pecasPorLook: Record<string,string[]> = {
  "1": ["peca-19.webp","peca-24.webp"],
  "2": ["peca-17.webp"],
  "3": ["peca-22.webp","peca-23.webp"],
  "4": ["peca-16.webp","peca-17.webp"],
  "5": ["peca-01.webp","peca-21.webp"],
  "6": ["peca-20.webp","peca-21.webp"],
};
export function CatalogPage() {
  const look = getParametro("look");

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

      setProdutos(look && pecasPorLook[look] ? lista.filter(produto =>
        produto.imagens?.some(img => pecasPorLook[look].some(nome => img.imagemUrl?.endsWith(nome)))
      ) : lista);
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
    () => (look && pecasPorLook[look] ? `Peças do look ${look.padStart(2,"0")}` : somenteDestaque ? "Destaques da DropZone" : "Peças em movimento"),
    [somenteDestaque, look]
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

      {look && pecasPorLook[look] && <div className="dz-look-context"><span>CURADORIA DROPZONE</span><p>Estas são as peças disponíveis que compõem o visual selecionado.</p><a href="/catalogo">Ver coleção completa →</a></div>}
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
