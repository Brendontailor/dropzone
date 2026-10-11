import { useEffect, useMemo, useState, type FormEvent } from "react";
import { listarProdutos } from "../api/produtos";
import { imagemLookUrl, listarLooks } from "../api/looks";
import { ProductCard } from "../components/ProductCard";
import type { Look, Produto } from "../types";

function getParametro(nome: string) {
  return new URLSearchParams(window.location.search).get(nome) ?? "";
}

export function CatalogPage() {
  const lookId = Number(getParametro("look"));
  const buscandoLook = Number.isInteger(lookId) && lookId > 0;
  const [look, setLook] = useState<Look | null>(null);

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
      const [lista, looks] = await Promise.all([
        listarProdutos({
          busca: buscandoLook ? undefined : busca.trim() || undefined,
          disponivel: true,
          destaque: buscandoLook ? undefined : somenteDestaque || undefined,
        }),
        buscandoLook ? listarLooks() : Promise.resolve([]),
      ]);
      const selecionado = buscandoLook ? looks.find(item => item.id === lookId) ?? null : null;
      setLook(selecionado);
      if (buscandoLook) {
        const produtosPorId = new Map(lista.map(produto => [produto.id, produto]));
        setProdutos(selecionado ? selecionado.itens.map(item => produtosPorId.get(item.produtoId)).filter((produto): produto is Produto => Boolean(produto)) : []);
      } else {
        setProdutos(lista);
      }
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
    () => (buscandoLook ? (look?.nome ?? "Look não encontrado") : somenteDestaque ? "Destaques da DropZone" : "Peças em movimento"),
    [somenteDestaque, look, buscandoLook]
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

        {!buscandoLook && <form className="search-form" onSubmit={pesquisar}>
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
        </form>}
      </div>

      {buscandoLook && look && <div className="dz-look-hero">
        <img src={imagemLookUrl(look.imagemUrl)} alt={`Visual ${look.nome}`} />
        <div><span className="eyebrow">CURADORIA DROPZONE / {look.itens.length} PEÇAS</span><h2>{look.nome}</h2><p>{look.descricao}</p><p>Explore abaixo todas as peças disponíveis deste visual. Os tamanhos são selecionados na página de cada produto.</p><a className="btn btn-outline" href="/catalogo">Explorar todo o catálogo →</a></div>
      </div>}
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
