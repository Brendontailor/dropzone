import { Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adicionarItemCarrinho } from "../api/carrinho";
import { sugerirLook } from "../api/ia";
import { listarProdutos } from "../api/produtos";
import { imagemLookUrl, listarLooks } from "../api/looks";
import { useAuth } from "../auth/AuthContext";
import { ProductCard } from "../components/ProductCard";
import type { Look, Produto, SugestaoIA } from "../types";
import { obterImagemProduto } from "../utils/produtoImagem";

const categorias = [
  { nome: "Camisetas", busca: "camiseta", imagem: "/home/categoria-camisetas.webp" },
  { nome: "Moletons", busca: "moletom", imagem: "/home/categoria-moletons.webp" },
  { nome: "Calças", busca: "calça", imagem: "/home/categoria-calcas.webp" },
  { nome: "Bermudas", busca: "bermuda", imagem: "/home/categoria-bermudas.webp" },
  { nome: "Jaquetas", busca: "jaqueta", imagem: "/home/categoria-jaquetas.webp" },
  { nome: "Bonés", busca: "boné", imagem: "/home/categoria-bones.webp" },
  { nome: "Tênis", busca: "tênis", imagem: "/home/categoria-tenis.webp" },
  { nome: "Acessórios", busca: "acessório", imagem: "/home/categoria-acessorios.webp" },
];

export function HomePage() {
  const { estaLogado } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [looks, setLooks] = useState<Look[]>([]);
  const [sugestaoIa, setSugestaoIa] = useState<SugestaoIA | null>(null);
  const [produtosSugestao, setProdutosSugestao] = useState<Record<number, Produto>>({});
  const [indiceProdutoIa, setIndiceProdutoIa] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [fazendoPedidoIa, setFazendoPedidoIa] = useState(false);
  const [erroIa, setErroIa] = useState("");

  useEffect(() => {
    listarLooks().then(setLooks).catch(() => setLooks([]));
    listarProdutos({ disponivel: true })
      .then(setProdutos)
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  }, []);

  const destaques = useMemo(() => {
    const destacados = produtos.filter((produto) => produto.destaque);

    return destacados.length > 0 ? destacados.slice(0, 8) : produtos.slice(0, 8);
  }, [produtos]);

  const opcoesProdutoIa = destaques.length > 0 ? destaques : produtos;
  const produtoBaseIa = opcoesProdutoIa[indiceProdutoIa % opcoesProdutoIa.length] ?? null;

  const imagemBaseIa = obterImagemProduto(produtoBaseIa);

  function trocarProdutoIa() {
    if (opcoesProdutoIa.length <= 1) return;

    setIndiceProdutoIa((indiceAtual) => (indiceAtual + 1) % opcoesProdutoIa.length);
    setSugestaoIa(null);
    setProdutosSugestao({});
    setErroIa("");
  }

  async function gerarSugestaoHome() {
    if (!produtoBaseIa) return;

    if (!estaLogado) {
      window.location.href = "/login";
      return;
    }

    setCarregandoIa(true);
    setErroIa("");
    setSugestaoIa(null);
    setProdutosSugestao({});

    try {
      const resultado = await sugerirLook(produtoBaseIa.id);
      const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
      const produtosEncontrados = Object.fromEntries(
        (resultado.sugestoes ?? [])
          .map((item) => produtosPorId.get(item.produtoId))
          .filter((produto): produto is Produto => Boolean(produto))
          .map((produto) => [produto.id, produto])
      );

      setSugestaoIa(resultado);
      setProdutosSugestao(produtosEncontrados);
    } catch (error) {
      setErroIa(
        error instanceof Error ? error.message : "Erro ao gerar sugestão de IA."
      );
    } finally {
      setCarregandoIa(false);
    }
  }

  async function fazerPedidoIa() {
    if (!sugestaoIa || !produtoBaseIa) return;

    if (!estaLogado) {
      window.location.href = "/login";
      return;
    }

    const produtosDoLook = new Map<number, Produto>();
    produtosDoLook.set(produtoBaseIa.id, produtoBaseIa);

    for (const item of sugestaoIa.sugestoes ?? []) {
      const produtoSugerido = produtosSugestao[item.produtoId];
      if (produtoSugerido) produtosDoLook.set(produtoSugerido.id, produtoSugerido);
    }

    const variacoes = [...produtosDoLook.values()]
      .map((produto) =>
        produto.variacoes?.find((variacao) => variacao.disponivel) ??
        produto.variacoes?.[0]
      )
      .filter((variacao): variacao is NonNullable<typeof variacao> => Boolean(variacao));

    if (variacoes.length === 0) {
      setErroIa("Nenhuma peça do look tem variação disponível para adicionar ao carrinho.");
      return;
    }

    setFazendoPedidoIa(true);
    setErroIa("");

    try {
      for (const variacao of variacoes) {
        await adicionarItemCarrinho(variacao.id, 1);
      }

      window.dispatchEvent(new Event("dropzone:carrinho-atualizado"));
      window.location.href = "/carrinho";
    } catch (error) {
      setErroIa(
        error instanceof Error ? error.message : "Erro ao adicionar look ao carrinho."
      );
    } finally {
      setFazendoPedidoIa(false);
    }
  }

  return (
    <main>
      <section className="hero" id="inicio">
        <div className="hero-slider" aria-hidden="true">
          <picture>
            <source srcSet="/home/hero-dropzone-campaign.webp" type="image/webp" />
            <img
              src="/home/hero-dropzone-campaign.png"
              alt=""
              fetchPriority="high"
              decoding="async"
              width={2172}
              height={724}
            />
          </picture>
        </div>

        <div className="hero-content">
          <span className="eyebrow">DropZone / Streetwear</span>
          <h1 className="dz-hero-headline">A RUA É NOSSA.<br /><span>O ESTILO É SEU.</span></h1>
          <p>Streetwear para quem tem identidade própria. Explore a coleção e monte seu próximo look.</p>
          <a className="btn btn-primary" href="/catalogo">
            Explorar coleção →
          </a>
        </div>

        <strong className="hero-graffiti">DROPZONE</strong>
      </section>

      <section className="categories-section" aria-label="Categorias de produtos">
        <div className="categories-heading">
          <div>
            <span className="eyebrow">Encontre sua peça</span>
            <h2>Explore por categoria</h2>
          </div>
          <span className="categories-hint" aria-hidden="true">Deslize para explorar →</span>
        </div>
        <div className="categories-strip" tabIndex={0} aria-label="Deslize para ver mais categorias">
          {categorias.map((categoria) => (
            <a
              className="category-card"
              href={`/catalogo?busca=${encodeURIComponent(categoria.busca)}`}
              key={categoria.nome}
            >
              <img src={categoria.imagem} alt="" loading="lazy" decoding="async" width={380} height={510} />
              <span>{categoria.nome}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="dz-models section" aria-label="Looks da coleção">
        <div className="section-heading dz-models-heading">
          <div><span className="eyebrow">DROPZONE / EDITORIAL</span><h2>O look completo. Peça por peça.</h2></div>
          <p>Escolha um visual e descubra as roupas que fazem parte dele.</p>
        </div>
        {looks.length > 0 && <div className="dz-models-grid">
          {looks.map((look, i) => <a className="dz-model-card" key={look.id} href={`/catalogo?look=${look.id}`}>
            <img src={imagemLookUrl(look.imagemUrl)} alt={`Modelo vestindo o look ${look.nome}`} loading="lazy" />
            <div className="dz-model-overlay"><small>LOOK {String(i + 1).padStart(2,"0")} · {look.itens.length} PEÇAS</small><strong>{look.nome}</strong><span>{look.descricao}</span><em>Conhecer as peças →</em></div>
          </a>)}
        </div>}
      </section>

      <section className="section graphite-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Selecionados</span>
            <h2>Mais desejados</h2>
          </div>
        </div>

        {carregando ? (
          <p className="status-text">Carregando destaques...</p>
        ) : destaques.length === 0 ? (
          <p className="status-text">Nenhum produto disponível ainda.</p>
        ) : (
          <div className="product-grid four">
            {destaques.map((produto) => (
              <ProductCard key={produto.id} produto={produto} modoHome />
            ))}
          </div>
        )}
      </section>

      <section className="ai-section" id="ia">
        <div className="ai-copy">
          <span className="eyebrow ai-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            Sugestão IA
          </span>
          <h2>Combine peças pelo clima da rua.</h2>
          <p>
            Escolhemos uma peça base do catálogo e a IA sugere uma combinação
            com outras peças disponíveis na loja.
          </p>
          <button
            className="btn btn-primary"
            type="button"
            disabled={!produtoBaseIa || carregandoIa}
            onClick={gerarSugestaoHome}
          >
            <Sparkles size={15} aria-hidden="true" />
            {carregandoIa ? "Gerando..." : "Gerar sugestão"}
          </button>
        </div>

        <article className="ai-base-card">
          <div className="ai-base-card-heading">
            <span>Peça analisada</span>
            <button
              type="button"
              onClick={trocarProdutoIa}
              disabled={opcoesProdutoIa.length <= 1 || carregandoIa}
            >
              Trocar peça
            </button>
          </div>
          <a href={produtoBaseIa ? `/produtos/${produtoBaseIa.id}` : "/catalogo"}>
            <img
              src={imagemBaseIa}
              alt={produtoBaseIa ? `Produto base: ${produtoBaseIa.nome}` : "Catálogo DropZone"}
              loading="lazy"
              decoding="async"
            />
          </a>
          <div>
            <small>{produtoBaseIa?.categoria?.nome ?? "Catálogo"}</small>
            <strong>{produtoBaseIa?.nome ?? "Escolha uma peça"}</strong>
          </div>
        </article>

        <div className="ai-detail">
          <div className="ai-label-block">
            <strong>
              {sugestaoIa ? "Look sugerido pela IA" : "Pronto para combinar"}
            </strong>
            {produtoBaseIa && (
              <small className="ai-base">Base: {produtoBaseIa.nome}</small>
            )}
          </div>

          {sugestaoIa ? (
            <>
              {sugestaoIa.explicacao && <p>{sugestaoIa.explicacao}</p>}

              {sugestaoIa.sugestoes && sugestaoIa.sugestoes.length > 0 && (
                <div className="ai-home-suggestions">
                  {sugestaoIa.sugestoes.slice(0, 3).map((item) => {
                    const produtoSugerido = produtosSugestao[item.produtoId];

                    return (
                      <a
                        className="ai-suggestion-card"
                        href={`/produtos/${item.produtoId}`}
                        key={item.produtoId}
                      >
                        {produtoSugerido && (
                          <img
                            src={obterImagemProduto(produtoSugerido)}
                            alt={produtoSugerido.nome}
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <div>
                          <b>{item.nome}</b>
                          {produtoSugerido && (
                            <small>
                              {Number(produtoSugerido.preco).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </small>
                          )}
                          <span>{item.motivo}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              <button
                className="btn btn-primary look-order-button"
                type="button"
                onClick={fazerPedidoIa}
                disabled={fazendoPedidoIa}
              >
                {fazendoPedidoIa ? "Adicionando..." : "Fazer pedido"}
              </button>
            </>
          ) : (
            <p>
              Clique para consultar a IA e receber uma combinação real com
              explicação e produtos clicáveis.
              {estaLogado ? "" : " É preciso estar logado para interagir."}
            </p>
          )}

          {erroIa && <p className="error">{erroIa}</p>}
        </div>
      </section>
    </main>
  );
}
