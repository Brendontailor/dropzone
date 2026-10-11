import { ArrowLeft, ArrowRight, CheckCircle2, Heart, MessageCircle, Minus, Plus, ShoppingBag, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { buscarDashboardAdmin } from "../api/admin";
import { buscarMinhasInteracoes } from "../api/auth";
import { criarAvaliacao, listarAvaliacoesProduto } from "../api/avaliacoes";
import {
  adicionarItemCarrinho,
  atualizarQuantidadeItemCarrinho,
  gerarPedidoWhatsapp,
  listarCarrinho,
  removerItemCarrinho,
} from "../api/carrinho";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "../api/favoritos";
import { sugerirLook } from "../api/ia";
import { buscarProdutoPorId } from "../api/produtos";
import { useAuth } from "../auth/AuthContext";
import { AdminNav } from "./AdminPages";
import type {
  Avaliacao,
  Carrinho,
  DashboardAdmin,
  Favorito,
  InteracoesUsuario,
  PedidoWhatsapp,
  Produto,
  ProdutoVariacao,
  SugestaoIA,
} from "../types";
import { obterImagemProduto } from "../utils/produtoImagem";
import { ProductGallery } from "../components/ProductGallery";

export function FavoritesPage() {
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarFavoritos() {
    setCarregando(true);
    setErro("");

    try {
      const lista = await listarFavoritos();
      setFavoritos(lista);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar favoritos.");
      setFavoritos([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarFavoritos();
  }, []);

  async function remover(produtoId: number) {
    setErro("");
    setMensagem("");

    try {
      await removerFavorito(produtoId);
      setFavoritos((lista) =>
        lista.filter((favorito) => favorito.produtoId !== produtoId)
      );
      setMensagem("Produto removido dos favoritos.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao remover favorito.");
    }
  }

  return (
    <main className="section catalog-page favorites-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Favoritos</span>
          <h1>Seus produtos favoritos</h1>
        </div>

        <a className="btn btn-outline" href="/catalogo">
          Ver catálogo
        </a>
      </div>

      {mensagem && <p className="success page-message">{mensagem}</p>}
      {erro && <p className="error page-message">{erro}</p>}

      {carregando ? (
        <p className="status-text">Carregando favoritos...</p>
      ) : favoritos.length === 0 ? (
        <section className="empty-panel inline-empty">
          <span className="eyebrow">Lista vazia</span>
          <h2>Nenhuma peça salva ainda.</h2>
          <p>
            Explore o catálogo e marque os produtos que você quer acompanhar de
            perto.
          </p>
          <a className="btn btn-primary" href="/catalogo">
            Explorar peças
          </a>
        </section>
      ) : (
        <div className="favorite-grid">
          {favoritos.map((favorito) => (
            <article className="favorite-item" key={favorito.id}>
              {favorito.produto ? (
                <>
                  <a className="favorite-image" href={`/produtos/${favorito.produto.id}`}>
                    <img
                      src={obterImagemProduto(favorito.produto)}
                      alt={favorito.produto.nome}
                    />
                  </a>

                  <div className="favorite-copy">
                    <small>{favorito.produto.categoria?.nome ?? "DropZone"}</small>
                    <a href={`/produtos/${favorito.produto.id}`}>
                      <strong>{favorito.produto.nome}</strong>
                    </a>
                    <span>
                      {Number(favorito.produto.preco).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>

                  <div className="favorite-actions">
                    <a className="btn btn-primary" href={`/produtos/${favorito.produto.id}`}>
                      Ver produto
                    </a>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => remover(favorito.produtoId)}
                    >
                      Remover
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="favorite-copy">
                    <small>Produto #{favorito.produtoId}</small>
                    <strong>Produto favoritado</strong>
                    <span>Os dados completos não vieram da API.</span>
                  </div>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={() => remover(favorito.produtoId)}
                  >
                    Remover
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export function CartPage() {
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
  const [pedido, setPedido] = useState<PedidoWhatsapp | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [finalizando, setFinalizando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarCarrinho() {
    setCarregando(true);
    setErro("");

    try {
      const carrinhoAtual = await listarCarrinho();
      setCarrinho(carrinhoAtual);
    } catch (error) {
      const texto = error instanceof Error ? error.message : "";
      if (texto.toLowerCase().includes("carrinho")) {
        setCarrinho(null);
      } else {
        setErro(texto || "Erro ao carregar carrinho.");
      }
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarCarrinho();
  }, []);

  const itens = carrinho?.itens ?? [];
  const totalUnidades = itens.reduce((soma, item) => soma + item.quantidade, 0);
  const total = itens.reduce((soma, item) => {
    const preco = Number(item.produtoVariacao.produto.preco);
    return soma + preco * item.quantidade;
  }, 0);
  const moeda = (valor: number) => valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  async function alterarQuantidade(itemId: number, quantidade: number) {
    const quantidadeSegura = Math.min(99, Math.max(1, Math.floor(quantidade)));
    setErro("");
    setMensagem("");
    setPedido(null);

    try {
      await atualizarQuantidadeItemCarrinho(itemId, quantidadeSegura);
      setCarrinho((atual) => atual ? {
        ...atual,
        itens: atual.itens.map((item) => item.id === itemId
          ? { ...item, quantidade: quantidadeSegura }
          : item),
      } : atual);
      window.dispatchEvent(new Event("dropzone:carrinho-atualizado"));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao alterar quantidade.");
    }
  }

  async function remover(itemId: number) {
    setErro("");
    setMensagem("");
    setPedido(null);

    try {
      await removerItemCarrinho(itemId);
      setCarrinho((atual) => atual ? {
        ...atual,
        itens: atual.itens.filter((item) => item.id !== itemId),
      } : atual);
      setMensagem("Peça removida do carrinho.");
      window.dispatchEvent(new Event("dropzone:carrinho-atualizado"));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao remover item.");
    }
  }

  async function finalizar() {
    if (itens.length === 0 || finalizando) return;
    setErro("");
    setMensagem("");
    setPedido(null);
    setFinalizando(true);

    try {
      const resultado = await gerarPedidoWhatsapp();
      setPedido(resultado);
      setMensagem("Seu pedido está pronto para revisar e enviar pelo WhatsApp.");
      window.dispatchEvent(new Event("dropzone:carrinho-atualizado"));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao preparar o pedido.");
    } finally {
      setFinalizando(false);
    }
  }

  return (
    <main className="section cart-page dz-cart-page">
      <header className="cart-page-header">
        <div className="cart-page-title">
          <span className="eyebrow">DropZone / Sacola</span>
          <h1>Seu carrinho.</h1>
          <p>Confira as peças, ajuste as quantidades e prepare seu pedido.</p>
        </div>
        <div className="cart-header-actions">
          {!carregando && itens.length > 0 && (
            <span className="cart-count-pill">
              <ShoppingBag size={16} aria-hidden="true" />
              {totalUnidades} {totalUnidades === 1 ? "peça" : "peças"}
            </span>
          )}
          <a className="btn btn-outline cart-continue-top" href="/catalogo">
            <ArrowLeft size={16} aria-hidden="true" /> Continuar comprando
          </a>
        </div>
      </header>

      {mensagem && <p className="success page-message" role="status">{mensagem}</p>}
      {erro && <p className="error page-message" role="alert">{erro}</p>}

      {carregando ? (
        <div className="cart-loading"><span className="cart-loading-dot" /> Carregando sua sacola...</div>
      ) : itens.length === 0 ? (
        <section className="cart-empty-state">
          <div className="cart-empty-icon"><ShoppingBag size={34} aria-hidden="true" /></div>
          <span className="eyebrow">Sua sacola está vazia</span>
          <h2>Seu próximo look começa aqui.</h2>
          <p>Explore o catálogo, escolha suas peças favoritas e volte para montar seu pedido.</p>
          <a className="btn btn-primary" href="/catalogo">
            Explorar catálogo <ArrowRight size={17} aria-hidden="true" />
          </a>
        </section>
      ) : (
        <div className="cart-layout dz-cart-layout">
          <section className="cart-list dz-cart-list" aria-label="Peças adicionadas ao carrinho">
            <div className="cart-list-header">
              <strong>Suas peças</strong>
              <span>{totalUnidades} {totalUnidades === 1 ? "unidade" : "unidades"}</span>
            </div>
            {itens.map((item, index) => {
              const variacao = item.produtoVariacao;
              const produto = variacao.produto;
              const preco = Number(produto.preco);
              const subtotal = preco * item.quantidade;
              const detalheVariacao = [variacao.cor?.nome, variacao.tamanho?.nome]
                .filter((parte) => parte && parte.toLowerCase() !== "sem cor")
                .join(" / ") || "Variação única";

              return (
                <article className="cart-item dz-cart-item" key={item.id}>
                  <a className="cart-image" href={`/produtos/${produto.id}`} aria-label={`Ver ${produto.nome}`}>
                    <img src={obterImagemProduto(produto)} alt={produto.nome} />
                  </a>
                  <div className="cart-copy">
                    <small>PEÇA {String(index + 1).padStart(2, "0")}</small>
                    <a href={`/produtos/${produto.id}`}><strong>{produto.nome}</strong></a>
                    <span className="cart-variant-label">{detalheVariacao}</span>
                    <span className="cart-unit-price">{moeda(preco)} <span>/ unidade</span></span>
                  </div>
                  <div className="cart-quantity-block">
                    <span>Quantidade</span>
                    <div className="cart-qty-control">
                      <button type="button" disabled={item.quantidade <= 1} onClick={() => void alterarQuantidade(item.id, item.quantidade - 1)} aria-label={`Diminuir quantidade de ${produto.nome}`}>
                        <Minus size={14} aria-hidden="true" />
                      </button>
                      <output aria-label={`Quantidade: ${item.quantidade}`}>{item.quantidade}</output>
                      <button type="button" disabled={item.quantidade >= 99} onClick={() => void alterarQuantidade(item.id, item.quantidade + 1)} aria-label={`Aumentar quantidade de ${produto.nome}`}>
                        <Plus size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="cart-item-total">
                    <small>Subtotal</small>
                    <strong>{moeda(subtotal)}</strong>
                  </div>
                  <button className="cart-remove" type="button" onClick={() => void remover(item.id)} aria-label={`Remover ${produto.nome}`} title="Remover peça">
                    <X size={17} aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary dz-cart-summary">
            <div className="cart-summary-heading">
              <span className="eyebrow">Resumo do pedido</span>
              <span className="cart-summary-count">{totalUnidades} {totalUnidades === 1 ? "peça" : "peças"}</span>
            </div>
            <div className="cart-summary-row">
              <span>Subtotal das peças</span>
              <strong>{moeda(total)}</strong>
            </div>
            <div className="cart-summary-row cart-summary-shipping">
              <span>Frete e pagamento</span>
              <span>Combinados no atendimento</span>
            </div>
            <div className="cart-summary-total">
              <span>Total dos produtos</span>
              <strong>{moeda(total)}</strong>
            </div>
            <p>Ao continuar, você gera o resumo do pedido para revisar e enviar à loja pelo WhatsApp.</p>
            <button className="btn btn-primary cart-checkout-button" type="button" onClick={() => void finalizar()} disabled={finalizando || itens.length === 0}>
              <MessageCircle size={18} aria-hidden="true" />
              {finalizando ? "Preparando pedido..." : "Finalizar pelo WhatsApp"}
              {!finalizando && <ArrowRight size={17} aria-hidden="true" />}
            </button>
            <a className="cart-summary-continue" href="/catalogo">Adicionar mais peças</a>

            {pedido && (
              <div className="whatsapp-result dz-whatsapp-result">
                <span className="whatsapp-ready"><CheckCircle2 size={16} aria-hidden="true" /> Pedido preparado</span>
                <a className="btn whatsapp-btn" href={pedido.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Abrir WhatsApp <ArrowRight size={16} aria-hidden="true" />
                </a>
                <label className="whatsapp-message-label" htmlFor="mensagem-pedido">Mensagem do pedido</label>
                <textarea id="mensagem-pedido" readOnly value={pedido.mensagem} />
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export function InteractionsPage() {
  const { usuario } = useAuth();
  const [interacoes, setInteracoes] = useState<InteracoesUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarMinhasInteracoes()
      .then(setInteracoes)
      .catch((error) => {
        setErro(error instanceof Error ? error.message : "Erro ao carregar interações.");
        setInteracoes(null);
      })
      .finally(() => setCarregando(false));
  }, []);

  const favoritos = interacoes?.favoritos ?? [];
  const avaliacoes = interacoes?.avaliacoes ?? [];
  const carrinhos = interacoes?.carrinhos ?? [];
  const pedidosFinalizados = carrinhos.filter((carrinho) => carrinho.finalizado);
  const carrinhosAbertos = carrinhos.filter((carrinho) => !carrinho.finalizado);

  const totalItensPedidos = carrinhos.reduce(
    (total, carrinho) =>
      total +
      carrinho.itens.reduce((soma, item) => soma + item.quantidade, 0),
    0
  );

  return (
    <main className="section interactions-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Interações</span>
          <h1>Olá, {usuario?.nome ?? "cliente"}</h1>
        </div>

        <a className="btn btn-outline" href="/catalogo">
          Continuar explorando
        </a>
      </div>

      {carregando ? (
        <p className="status-text">Carregando interações...</p>
      ) : erro ? (
        <p className="error page-message">{erro}</p>
      ) : !interacoes ? (
        <p className="status-text">Nenhuma interação encontrada.</p>
      ) : (
        <>
          <section className="interaction-metrics">
            <article>
              <span>Favoritos</span>
              <strong>{favoritos.length}</strong>
            </article>
            <article>
              <span>Avaliações</span>
              <strong>{avaliacoes.length}</strong>
            </article>
            <article>
              <span>Pedidos</span>
              <strong>{pedidosFinalizados.length}</strong>
            </article>
            <article>
              <span>Itens</span>
              <strong>{totalItensPedidos}</strong>
            </article>
          </section>

          <div className="interaction-grid">
            <section className="interaction-panel">
              <div className="panel-heading">
                <span className="eyebrow">Favoritos</span>
                <h2>Peças salvas</h2>
              </div>

              {favoritos.length === 0 ? (
                <p className="status-text">Você ainda não salvou favoritos.</p>
              ) : (
                <div className="mini-list">
                  {favoritos.map((favorito) => (
                    <a
                      href={`/produtos/${favorito.produtoId}`}
                      key={favorito.id}
                      className="mini-row"
                    >
                      <strong>{favorito.produto?.nome ?? `Produto #${favorito.produtoId}`}</strong>
                      <span>
                        {favorito.produto
                          ? Number(favorito.produto.preco).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                          : "Ver produto"}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section className="interaction-panel">
              <div className="panel-heading">
                <span className="eyebrow">Avaliações</span>
                <h2>Suas opiniões</h2>
              </div>

              {avaliacoes.length === 0 ? (
                <p className="status-text">Você ainda não avaliou produtos.</p>
              ) : (
                <div className="mini-list">
                  {avaliacoes.map((avaliacao) => (
                    <article key={avaliacao.id} className="mini-row review-mini">
                      <strong>{avaliacao.produto?.nome ?? `Produto #${avaliacao.produtoId}`}</strong>
                      <span>{avaliacao.nota} ★</span>
                      {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                      {avaliacao.respostaAdmin && (
                        <div className="admin-reply">
                          <b>Resposta da loja</b>
                          <span>{avaliacao.respostaAdmin}</span>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="interaction-panel wide">
              <div className="panel-heading">
                <span className="eyebrow">Pedidos</span>
                <h2>Carrinhos e pedidos</h2>
              </div>

              {carrinhos.length === 0 ? (
                <p className="status-text">Você ainda não tem carrinhos ou pedidos.</p>
              ) : (
                <div className="order-list">
                  {carrinhos.map((carrinho) => {
                    const total = carrinho.itens.reduce((soma, item) => {
                      return (
                        soma +
                        Number(item.produtoVariacao.produto.preco) * item.quantidade
                      );
                    }, 0);

                    return (
                      <article className="order-card" key={carrinho.id}>
                        <div>
                          <span className={carrinho.finalizado ? "order-status done" : "order-status"}>
                            {carrinho.finalizado ? "Finalizado" : "Aberto"}
                          </span>
                          <strong>Pedido #{carrinho.id}</strong>
                          <small>
                            {carrinho.itens.length} itens /{" "}
                            {total.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </small>
                        </div>

                        <div className="order-items">
                          {carrinho.itens.slice(0, 4).map((item) => (
                            <span key={item.id}>
                              {item.quantidade}x {item.produtoVariacao.produto.nome}
                            </span>
                          ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {carrinhosAbertos.length > 0 && (
            <a className="btn btn-primary interactions-cart-link" href="/carrinho">
              Ver carrinho aberto
            </a>
          )}
        </>
      )}
    </main>
  );
}

export function AdminPage() {
  const [dashboard, setDashboard] = useState<DashboardAdmin | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarDashboardAdmin()
      .then(setDashboard)
      .catch((error) => {
        setErro(error instanceof Error ? error.message : "Erro ao carregar dashboard.");
      })
      .finally(() => setCarregando(false));
  }, []);

  const maiorTotalGeral = dashboard
    ? Math.max(
        dashboard.totais.produtos,
        dashboard.totais.clientes,
        dashboard.totais.avaliacoes,
        dashboard.totais.favoritos,
        dashboard.totais.pedidosFinalizados,
        1
      )
    : 1;

  const maiorFavoritos = dashboard
    ? Math.max(
        ...dashboard.produtosMaisFavoritados.map((produto) => produto.totalFavoritos),
        1
      )
    : 1;

  const maiorAvaliacoes = dashboard
    ? Math.max(
        ...dashboard.produtosMelhorAvaliados.map((produto) => produto.mediaAvaliacao),
        1
      )
    : 1;

  const mediaGeral = dashboard?.produtosMelhorAvaliados.length
    ? dashboard.produtosMelhorAvaliados.reduce(
        (total, produto) => total + Number(produto.mediaAvaliacao),
        0
      ) / dashboard.produtosMelhorAvaliados.length
    : 0;

  return (
    <main className="section admin-dashboard-page">
      <AdminNav />
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Dashboard</h1>
        </div>

        <div className="admin-shortcuts">
          <a className="btn btn-outline" href="/admin/interacoes">
            Interações
          </a>
          <a className="btn btn-outline" href="/catalogo">
            Ver loja
          </a>
        </div>
      </div>

      {carregando ? (
        <p className="status-text">Carregando dashboard...</p>
      ) : erro ? (
        <p className="error page-message">{erro}</p>
      ) : !dashboard ? (
        <p className="status-text">Nenhum dado encontrado.</p>
      ) : (
        <>
          <section className="admin-metrics">
            <article>
              <span>Produtos</span>
              <strong>{dashboard.totais.produtos}</strong>
              <small>Catálogo ativo</small>
            </article>
            <article>
              <span>Clientes</span>
              <strong>{dashboard.totais.clientes}</strong>
              <small>Contas criadas</small>
            </article>
            <article>
              <span>Avaliações</span>
              <strong>{dashboard.totais.avaliacoes}</strong>
              <small>Feedbacks recebidos</small>
            </article>
            <article>
              <span>Favoritos</span>
              <strong>{dashboard.totais.favoritos}</strong>
              <small>Interesse em peças</small>
            </article>
            <article>
              <span>Pedidos</span>
              <strong>{dashboard.totais.pedidosFinalizados}</strong>
              <small>Finalizados</small>
            </article>
          </section>

          <section className="admin-chart-grid">
            <article className="admin-overview-card">
              <div>
                <span className="eyebrow">Resumo operacional</span>
                <h2>Visão geral da loja</h2>
                <p>
                  Acompanhe catálogo, clientes e interações para decidir quais
                  peças destacar e quais avaliações responder primeiro.
                </p>
              </div>

              <div className="admin-health-grid">
                <span>
                  <b>{mediaGeral.toFixed(1)} ★</b>
                  média dos melhores
                </span>
                <span>
                  <b>{dashboard.produtosMaisFavoritados.length}</b>
                  produtos no ranking
                </span>
                <span>
                  <b>{dashboard.totais.favoritos + dashboard.totais.avaliacoes}</b>
                  interações totais
                </span>
              </div>
            </article>

            <article className="admin-chart-card">
              <div className="panel-heading">
                <span className="eyebrow">Visão geral</span>
                <h2>Volume do sistema</h2>
              </div>

              <div className="bar-chart">
                {[
                  ["Produtos", dashboard.totais.produtos],
                  ["Clientes", dashboard.totais.clientes],
                  ["Avaliações", dashboard.totais.avaliacoes],
                  ["Favoritos", dashboard.totais.favoritos],
                  ["Pedidos", dashboard.totais.pedidosFinalizados],
                ].map(([label, valor]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <div>
                      <i style={{ width: `${(Number(valor) / maiorTotalGeral) * 100}%` }} />
                    </div>
                    <b>{valor}</b>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-chart-card">
              <div className="panel-heading">
                <span className="eyebrow">Ranking</span>
                <h2>Mais favoritados</h2>
              </div>

              {dashboard.produtosMaisFavoritados.length === 0 ? (
                <p className="status-text">Sem favoritos registrados.</p>
              ) : (
                <div className="ranking-chart">
                  {dashboard.produtosMaisFavoritados.map((produto) => (
                    <a className="ranking-row" href={`/produtos/${produto.id}`} key={produto.id}>
                      <strong>{produto.nome}</strong>
                      <div>
                        <i
                          style={{
                            width: `${(produto.totalFavoritos / maiorFavoritos) * 100}%`,
                          }}
                        />
                      </div>
                      <span>{produto.totalFavoritos}</span>
                    </a>
                  ))}
                </div>
              )}
            </article>

            <article className="admin-chart-card wide">
              <div className="panel-heading">
                <span className="eyebrow">Avaliações</span>
                <h2>Melhor avaliados</h2>
              </div>

              {dashboard.produtosMelhorAvaliados.length === 0 ? (
                <p className="status-text">Sem avaliações registradas.</p>
              ) : (
                <div className="rating-chart">
                  {dashboard.produtosMelhorAvaliados.map((produto) => (
                    <a
                      className="rating-bar"
                      href={`/produtos/${produto.id}`}
                      key={produto.id}
                      style={
                        produto.imagemUrl
                          ? { backgroundImage: `url(${produto.imagemUrl})` }
                          : undefined
                      }
                    >
                      <div>
                        <strong>{produto.nome}</strong>
                        <span>
                          {Number(produto.mediaAvaliacao).toFixed(1)} ★ /{" "}
                          {produto.totalAvaliacoes} avaliações
                        </span>
                      </div>
                      <meter
                        min={0}
                        max={5}
                        value={Number(produto.mediaAvaliacao)}
                        aria-label={`Média de ${produto.nome}`}
                      />
                      <i
                        style={{
                          height: `${(Number(produto.mediaAvaliacao) / maiorAvaliacoes) * 100}%`,
                        }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      )}
    </main>
  );
}

export function ProductDetailPage({ id }: { id: string }) {
  const produtoId = Number(id);
  const { estaLogado } = useAuth();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [variacaoSelecionada, setVariacaoSelecionada] =
    useState<ProdutoVariacao | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [adicionandoCarrinho, setAdicionandoCarrinho] = useState(false);
  const [carrinhoConfirmado, setCarrinhoConfirmado] = useState(false);
  const [favoritado, setFavoritado] = useState(false);
  const [carregandoFavorito, setCarregandoFavorito] = useState(false);
  const [nota, setNota] = useState(5);
  const [notaHover, setNotaHover] = useState(0);
  const [comentario, setComentario] = useState("");
  const [sugestao, setSugestao] = useState<SugestaoIA | null>(null);
  const [produtosSugestao, setProdutosSugestao] = useState<Record<number, Produto>>({});
  const [carregando, setCarregando] = useState(true);
  const [carregandoIa, setCarregandoIa] = useState(false);
  const [fazendoPedidoIa, setFazendoPedidoIa] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    Promise.all([
      buscarProdutoPorId(produtoId),
      listarAvaliacoesProduto(produtoId).catch(() => []),
    ])
      .then(([produtoEncontrado, listaAvaliacoes]) => {
        if (!ativo) return;

        setProduto(produtoEncontrado);
        setAvaliacoes(listaAvaliacoes);

        const primeiraDisponivel =
          produtoEncontrado.variacoes?.find((variacao) => variacao.disponivel) ??
          produtoEncontrado.variacoes?.[0] ??
          null;

        setVariacaoSelecionada(primeiraDisponivel);
      })
      .catch((error) => {
        if (!ativo) return;
        setErro(error instanceof Error ? error.message : "Erro ao carregar produto.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, [produtoId]);

  useEffect(() => {
    let ativo = true;

    if (!estaLogado) {
      setFavoritado(false);
      setCarregandoFavorito(false);
      return () => {
        ativo = false;
      };
    }

    setCarregandoFavorito(true);
    listarFavoritos()
      .then((favoritosAtuais) => {
        if (ativo) {
          setFavoritado(favoritosAtuais.some((favorito) => favorito.produtoId === produtoId));
        }
      })
      .catch(() => {
        if (ativo) setFavoritado(false);
      })
      .finally(() => {
        if (ativo) setCarregandoFavorito(false);
      });

    return () => {
      ativo = false;
    };
  }, [estaLogado, produtoId]);

  const precoNumerico = Number(produto?.preco ?? 0);
  const formatarMoedaProduto = (valor: number) => valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const preco = formatarMoedaProduto(precoNumerico);
  const subtotalSelecionado = formatarMoedaProduto(precoNumerico * quantidade);

  const mediaAvaliacoes = useMemo(() => {
    if (produto?.mediaAvaliacoes !== undefined) return Number(produto.mediaAvaliacoes);
    if (avaliacoes.length === 0) return 0;

    return (
      avaliacoes.reduce((total, avaliacao) => total + avaliacao.nota, 0) /
      avaliacoes.length
    );
  }, [produto?.mediaAvaliacoes, avaliacoes]);

  function exigirLogin() {
    if (estaLogado) return false;

    window.location.href = "/login";
    return true;
  }

  async function alternarFavoritoProduto() {
    if (!produto || exigirLogin() || carregandoFavorito) return;

    setMensagem("");
    setErro("");
    setCarrinhoConfirmado(false);
    setCarregandoFavorito(true);

    try {
      if (favoritado) {
        await removerFavorito(produto.id);
        setFavoritado(false);
        setMensagem("Produto removido dos favoritos.");
      } else {
        await adicionarFavorito(produto.id);
        setFavoritado(true);
        setMensagem("Produto adicionado aos favoritos.");
      }
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível atualizar os favoritos.");
    } finally {
      setCarregandoFavorito(false);
    }
  }

  async function adicionarAoCarrinho() {
    if (!produto) return;

    if (!variacaoSelecionada || !variacaoSelecionada.disponivel) {
      setErro("Selecione uma variação disponível antes de adicionar ao carrinho.");
      return;
    }

    if (exigirLogin()) return;

    const quantidadeSegura = Math.min(99, Math.max(1, Math.floor(quantidade || 1)));
    setQuantidade(quantidadeSegura);
    setAdicionandoCarrinho(true);
    setCarrinhoConfirmado(false);
    setMensagem("");
    setErro("");

    try {
      await adicionarItemCarrinho(variacaoSelecionada.id, quantidadeSegura);
      setCarrinhoConfirmado(true);
      window.dispatchEvent(new Event("dropzone:carrinho-atualizado"));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao adicionar ao carrinho.");
    } finally {
      setAdicionandoCarrinho(false);
    }
  }

  async function enviarAvaliacao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (exigirLogin()) return;

    setMensagem("");
    setErro("");

    try {
      const novaAvaliacao = await criarAvaliacao(produtoId, {
        nota,
        comentario: comentario.trim() || undefined,
      });

      setAvaliacoes((lista) => [novaAvaliacao, ...lista]);
      setComentario("");
      setMensagem("Avaliação enviada.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao avaliar produto.");
    }
  }

  async function gerarSugestaoIa() {
    if (exigirLogin()) return;

    setCarregandoIa(true);
    setMensagem("");
    setErro("");
    setSugestao(null);
    setProdutosSugestao({});

    try {
      const resultado = await sugerirLook(produtoId);
      const detalhes = await Promise.all(
        (resultado.sugestoes ?? []).map((item) =>
          buscarProdutoPorId(item.produtoId).catch(() => null)
        )
      );

      setSugestao(resultado);
      setProdutosSugestao(
        Object.fromEntries(
          detalhes
            .filter((item): item is Produto => Boolean(item))
            .map((item) => [item.id, item])
        )
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao gerar sugestão de IA.");
    } finally {
      setCarregandoIa(false);
    }
  }

  async function fazerPedidoIa() {
    if (!produto || !sugestao) return;
    if (exigirLogin()) return;

    const produtosDoLook = new Map<number, Produto>();
    produtosDoLook.set(produto.id, produto);

    for (const item of sugestao.sugestoes ?? []) {
      const produtoSugerido = produtosSugestao[item.produtoId];
      if (produtoSugerido) produtosDoLook.set(produtoSugerido.id, produtoSugerido);
    }

    const variacoes = [...produtosDoLook.values()]
      .map((item) =>
        item.variacoes?.find((variacao) => variacao.disponivel) ??
        item.variacoes?.[0]
      )
      .filter((variacao): variacao is ProdutoVariacao => Boolean(variacao));

    if (variacoes.length === 0) {
      setErro("Nenhuma peça do look tem variação disponível para adicionar ao carrinho.");
      return;
    }

    setFazendoPedidoIa(true);
    setMensagem("");
    setErro("");

    try {
      for (const variacao of variacoes) {
        await adicionarItemCarrinho(variacao.id, 1);
      }

      window.dispatchEvent(new Event("dropzone:carrinho-atualizado"));
      window.location.href = "/carrinho";
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao adicionar look ao carrinho.");
    } finally {
      setFazendoPedidoIa(false);
    }
  }

  if (carregando) {
    return (
      <main className="page-shell">
        <section className="empty-panel">Carregando produto...</section>
      </main>
    );
  }

  if (erro && !produto) {
    return (
      <main className="page-shell">
        <section className="empty-panel">
          <span className="eyebrow">Produto</span>
          <h1>Não foi possível carregar.</h1>
          <p>{erro}</p>
          <a className="btn btn-primary" href="/catalogo">
            Voltar ao catálogo
          </a>
        </section>
      </main>
    );
  }

  if (!produto) {
    return null;
  }

  return (
    <main className="product-page dz-product-page">
      <nav className="product-breadcrumb" aria-label="Você está em">
        <a href="/">Início</a>
        <span aria-hidden="true">/</span>
        <a href="/catalogo">Catálogo</a>
        <span aria-hidden="true">/</span>
        <span>{produto.categoria?.nome ?? "Peças"}</span>
      </nav>

      <section className="product-detail dz-product-detail">
        <div className="product-gallery-column">
          <ProductGallery produto={produto} />
          <div className="product-gallery-meta">
            <span>DROPZONE / ORIGINAL STREETWEAR</span>
            <span>REF. DZ-{String(produto.id).padStart(4, "0")}</span>
          </div>
        </div>

        <div className="detail-copy product-info-panel">
          <div className="product-info-topline">
            <span className="eyebrow">{produto.categoria?.nome ?? "DropZone"}</span>
            <span className="product-ref">DZ-{String(produto.id).padStart(4, "0")}</span>
          </div>
          <h1>{produto.nome}</h1>
          <div className="product-price-block">
            <strong className="detail-price">{preco}</strong>
            <span>Preço da peça</span>
          </div>
          <p className="product-description">
            {produto.descricao?.trim() || "Uma peça do drop atual DropZone. Escolha sua variação e adicione à sacola para preparar seu pedido."}
          </p>

          <div className="product-rating-summary">
            <div className="product-rating-stars" aria-label={`${mediaAvaliacoes.toFixed(1)} de 5 estrelas`}>
              {Array.from({ length: 5 }, (_, index) => (
                <span key={index} className={index < Math.round(mediaAvaliacoes) ? "is-filled" : ""} aria-hidden="true">★</span>
              ))}
            </div>
            <strong>{mediaAvaliacoes.toFixed(1)}</strong>
            <a href="#avaliacoes">
              {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
            </a>
          </div>

          <div className="variation-box">
            <div className="variation-heading">
              <span className="field-label">Escolha sua variação</span>
              {variacaoSelecionada && (
                <span className={`variation-stock ${variacaoSelecionada.disponivel ? "is-available" : "is-unavailable"}`}>
                  <i aria-hidden="true" />
                  {variacaoSelecionada.disponivel ? "Disponível" : "Indisponível"}
                </span>
              )}
            </div>
            {produto.variacoes && produto.variacoes.length > 0 ? (
              <div className="variation-grid">
                {produto.variacoes.map((variacao) => (
                  <button
                    key={variacao.id}
                    className={variacaoSelecionada?.id === variacao.id ? "variation-option selected" : "variation-option"}
                    type="button"
                    disabled={!variacao.disponivel}
                    aria-pressed={variacaoSelecionada?.id === variacao.id}
                    onClick={() => {
                      setVariacaoSelecionada(variacao);
                      setCarrinhoConfirmado(false);
                      setErro("");
                    }}
                  >
                    <span>{variacao.tamanho?.nome ?? "Único"}</span>
                    <small>{variacao.cor?.nome ?? "Sem cor"}</small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="status-text">Esse produto ainda não tem variações cadastradas.</p>
            )}
          </div>

          <div className="product-selection-meta">
            <span>Quantidade</span>
            <span className="product-subtotal-label">Subtotal da seleção <strong>{subtotalSelecionado}</strong></span>
          </div>
          <div className="detail-actions product-detail-actions">
            <div className="product-quantity-field">
              <div className="quantity-stepper" aria-label="Quantidade do produto">
                <button type="button" disabled={quantidade <= 1} onClick={() => { setQuantidade((atual) => Math.max(1, atual - 1)); setCarrinhoConfirmado(false); }} aria-label="Diminuir quantidade">
                  <Minus size={14} aria-hidden="true" />
                </button>
                <input
                  min={1}
                  max={99}
                  type="number"
                  inputMode="numeric"
                  value={quantidade}
                  aria-label="Quantidade"
                  onChange={(event) => {
                    const valor = Number(event.target.value);
                    setQuantidade(Math.min(99, Math.max(1, Math.floor(valor || 1))));
                    setCarrinhoConfirmado(false);
                  }}
                />
                <button type="button" disabled={quantidade >= 99} onClick={() => { setQuantidade((atual) => Math.min(99, atual + 1)); setCarrinhoConfirmado(false); }} aria-label="Aumentar quantidade">
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
            </div>

            <button
              className="btn btn-primary product-add-button"
              type="button"
              onClick={() => void adicionarAoCarrinho()}
              disabled={adicionandoCarrinho || !variacaoSelecionada?.disponivel}
            >
              <ShoppingBag size={17} aria-hidden="true" />
              {adicionandoCarrinho ? "Adicionando..." : "Adicionar ao carrinho"}
              {!adicionandoCarrinho && <ArrowRight size={17} aria-hidden="true" />}
            </button>

            <button
              className={`btn ${favoritado ? "btn-primary is-favorited" : "btn-outline"} product-favorite-button`}
              type="button"
              onClick={() => void alternarFavoritoProduto()}
              disabled={carregandoFavorito}
              aria-pressed={favoritado}
            >
              <Heart size={16} fill={favoritado ? "currentColor" : "none"} aria-hidden="true" />
              {carregandoFavorito ? "Salvando..." : favoritado ? "Favoritado" : "Favoritar"}
            </button>
          </div>

          {carrinhoConfirmado && (
            <div className="cart-added-confirmation" role="status" aria-live="polite">
              <div className="cart-added-copy">
                <CheckCircle2 size={22} aria-hidden="true" />
                <span>
                  <strong>Adicionado ao carrinho</strong>
                  <small>{quantidade} × {produto.nome}</small>
                </span>
              </div>
              <div className="cart-added-actions">
                <a href="/carrinho" className="cart-confirmation-link">Ver carrinho <ArrowRight size={15} aria-hidden="true" /></a>
                <button type="button" onClick={() => setCarrinhoConfirmado(false)}>Continuar vendo</button>
              </div>
            </div>
          )}

          <div className="product-order-note">
            <MessageCircle size={16} aria-hidden="true" />
            <span>Revise seu carrinho e envie o pedido pelo WhatsApp da loja.</span>
          </div>

          <button className="ia-button" type="button" onClick={() => void gerarSugestaoIa()} disabled={carregandoIa}>
            <Sparkles size={15} aria-hidden="true" />
            {carregandoIa ? "Montando combinação..." : "Montar look com IA"}
            {!carregandoIa && <ArrowRight size={15} aria-hidden="true" />}
          </button>

          {mensagem && <p className="success" role="status">{mensagem}</p>}
          {erro && <p className="error" role="alert">{erro}</p>}
        </div>
      </section>
      {sugestao && (
        <section className="detail-section ia-result">
          <span className="eyebrow ai-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            {sugestao.fonte ?? "Gerado por IA"}
          </span>
          <h2>Sugestão de combinação</h2>
          {sugestao.explicacao && <p>{sugestao.explicacao}</p>}

          {sugestao.sugestoes && sugestao.sugestoes.length > 0 && (
            <div className="suggestion-list">
              {sugestao.sugestoes.map((item) => {
                const produtoSugerido = produtosSugestao[item.produtoId];
                const imagem = obterImagemProduto(produtoSugerido);

                return (
                  <a key={item.produtoId} href={`/produtos/${item.produtoId}`}>
                    <img src={imagem} alt={produtoSugerido?.nome ?? item.nome} />
                    <div>
                      <strong>{item.nome}</strong>
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
        </section>
      )}

      <section className="detail-section reviews-section" id="avaliacoes">
        <div className="section-heading compact reviews-heading">
          <div>
            <span className="eyebrow">Avaliações</span>
            <h2>Opinião de quem usa</h2>
          </div>
          <span className="review-count">
            {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
          </span>
        </div>

        <form className="review-form" onSubmit={enviarAvaliacao}>
          <div className="review-rating-picker">
            <span className="review-rating-label">Sua nota</span>
            <div className="review-stars" role="group" aria-label="Escolha uma nota de 1 a 5 estrelas">
              {[1, 2, 3, 4, 5].map((valor) => (
                <button
                  key={valor}
                  className={`review-star-button ${valor <= (notaHover || nota) ? "is-active" : ""}`}
                  type="button"
                  aria-label={`${valor} ${valor === 1 ? "estrela" : "estrelas"}`}
                  aria-pressed={nota === valor}
                  title={`${valor} ${valor === 1 ? "estrela" : "estrelas"}`}
                  onClick={() => setNota(valor)}
                  onMouseEnter={() => setNotaHover(valor)}
                  onMouseLeave={() => setNotaHover(0)}
                  onFocus={() => setNotaHover(valor)}
                  onBlur={() => setNotaHover(0)}
                >
                  <span aria-hidden="true">★</span>
                </button>
              ))}
            </div>
            <span className="review-rating-value">{nota} de 5</span>
          </div>

          <textarea
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            placeholder="Conte o que achou desta peça..."
            aria-label="Escreva sua avaliação"
            rows={3}
          />
          <button className="btn btn-primary review-submit" type="submit">
            Publicar avaliação
          </button>
        </form>

        <div className="review-list">
          {avaliacoes.length === 0 ? (
            <div className="review-empty-state">
              <span className="review-empty-star" aria-hidden="true">☆</span>
              <div>
                <strong>Seja a primeira pessoa a avaliar</strong>
                <p>Sua opinião ajuda outras pessoas a escolherem melhor.</p>
              </div>
            </div>
          ) : (
            avaliacoes.map((avaliacao) => (
              <article className="review-card" key={avaliacao.id}>
                <div className="review-card-top">
                  <div
                    className="review-stars-display"
                    aria-label={`${avaliacao.nota} de 5 estrelas`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={index < avaliacao.nota ? "is-filled" : ""}
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <small>{avaliacao.usuario?.nome ?? "Cliente DropZone"}</small>
                </div>
                {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                {avaliacao.respostaAdmin && (
                  <div className="admin-reply">
                    <b>Resposta da loja</b>
                    <span>{avaliacao.respostaAdmin}</span>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

