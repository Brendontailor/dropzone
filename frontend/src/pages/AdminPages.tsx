import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  excluirAvaliacaoAdmin,
  listarAvaliacoesAdmin,
  listarFavoritosAdmin,
  listarPedidosAdmin,
  responderAvaliacaoAdmin,
} from "../api/admin";
import {
  atualizarCategoria,
  atualizarCor,
  atualizarTamanho,
  criarCategoria,
  criarCor,
  criarTamanho,
  deletarCategoria,
  deletarCor,
  deletarTamanho,
  listarCategorias,
  listarCores,
  listarTamanhos,
} from "../api/cadastros";
import {
  atualizarDisponibilidadeProduto,
  atualizarDisponibilidadeVariacao,
  atualizarProduto,
  criarVariacaoProduto,
  criarProduto,
  deletarProduto,
  listarVariacoesProduto,
  listarProdutos,
} from "../api/produtos";
import type {
  Avaliacao,
  Carrinho,
  Categoria,
  Cor,
  Favorito,
  Produto,
  ProdutoVariacao,
  Tamanho,
} from "../types";

export function AdminNav() {
  return (
    <nav className="admin-tabs">
      <a href="/admin">Dashboard</a>
      <a href="/admin/produtos">Produtos</a>
      <a href="/admin/interacoes">Interações</a>
      <a href="/admin/categorias">Categorias</a>
      <a href="/admin/cores">Cores</a>
      <a href="/admin/tamanhos">Tamanhos</a>
    </nav>
  );
}

export function AdminInteractionsPage() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [pedidos, setPedidos] = useState<Carrinho[]>([]);
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [listaAvaliacoes, listaFavoritos, listaPedidos] = await Promise.all([
        listarAvaliacoesAdmin(),
        listarFavoritosAdmin(),
        listarPedidosAdmin(),
      ]);

      setAvaliacoes(listaAvaliacoes);
      setFavoritos(listaFavoritos);
      setPedidos(listaPedidos);
      setRespostas(
        Object.fromEntries(
          listaAvaliacoes.map((avaliacao) => [
            avaliacao.id,
            avaliacao.respostaAdmin ?? "",
          ])
        )
      );
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar interações.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function responder(id: number) {
    const respostaAdmin = respostas[id]?.trim();

    if (!respostaAdmin) {
      setErro("Digite uma resposta antes de salvar.");
      return;
    }

    setErro("");
    setMensagem("");

    try {
      const atualizada = await responderAvaliacaoAdmin(id, respostaAdmin);
      setAvaliacoes((lista) =>
        lista.map((avaliacao) =>
          avaliacao.id === id
            ? { ...avaliacao, respostaAdmin: atualizada.respostaAdmin }
            : avaliacao
        )
      );
      setMensagem("Resposta salva.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao responder avaliação.");
    }
  }

  async function excluir(id: number) {
    setErro("");
    setMensagem("");

    try {
      await excluirAvaliacaoAdmin(id);
      setAvaliacoes((lista) => lista.filter((avaliacao) => avaliacao.id !== id));
      setMensagem("Avaliação excluída.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao excluir avaliação.");
    }
  }

  return (
    <main className="section admin-dashboard-page">
      <AdminNav />
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Interações</h1>
        </div>
      </div>

      {mensagem && <p className="success page-message">{mensagem}</p>}
      {erro && <p className="error page-message">{erro}</p>}

      {carregando ? (
        <p className="status-text">Carregando interações...</p>
      ) : (
        <div className="admin-interactions-grid">
          <section className="admin-table-card wide">
            <div className="panel-heading">
              <span className="eyebrow">Avaliações</span>
              <h2>Responder e moderar</h2>
            </div>

            <div className="admin-review-list">
              {avaliacoes.length === 0 ? (
                <p className="status-text">Nenhuma avaliação registrada.</p>
              ) : (
                avaliacoes.map((avaliacao) => (
                  <article key={avaliacao.id} className="admin-review-row">
                    <div>
                      <strong>{avaliacao.produto?.nome ?? `Produto #${avaliacao.produtoId}`}</strong>
                      <small>
                        {avaliacao.usuario?.nome ?? "Cliente"} / {avaliacao.nota} ★
                      </small>
                      {avaliacao.comentario && <p>{avaliacao.comentario}</p>}
                    </div>

                    <textarea
                      value={respostas[avaliacao.id] ?? ""}
                      onChange={(event) =>
                        setRespostas((atual) => ({
                          ...atual,
                          [avaliacao.id]: event.target.value,
                        }))
                      }
                      placeholder="Resposta do administrador..."
                    />

                    <div className="table-actions">
                      <button className="btn btn-primary" type="button" onClick={() => responder(avaliacao.id)}>
                        Responder
                      </button>
                      <button className="btn btn-outline" type="button" onClick={() => excluir(avaliacao.id)}>
                        Excluir
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-table-card">
            <div className="panel-heading">
              <span className="eyebrow">Favoritos</span>
              <h2>Clientes interessados</h2>
            </div>
            <div className="mini-list">
              {favoritos.length === 0 ? (
                <p className="status-text">Nenhum favorito registrado.</p>
              ) : (
                favoritos.map((favorito) => (
                  <article className="mini-row" key={favorito.id}>
                    <strong>{favorito.produto?.nome ?? `Produto #${favorito.produtoId}`}</strong>
                    <span>{favorito.usuario?.nome ?? "Cliente"} / {favorito.usuario?.email}</span>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-table-card">
            <div className="panel-heading">
              <span className="eyebrow">Pedidos</span>
              <h2>Carrinhos</h2>
            </div>
            <div className="mini-list">
              {pedidos.length === 0 ? (
                <p className="status-text">Nenhum pedido registrado.</p>
              ) : (
                pedidos.map((pedido) => (
                  <article className="mini-row" key={pedido.id}>
                    <strong>Pedido #{pedido.id}</strong>
                    <span>
                      {pedido.usuario?.nome ?? "Cliente"} /{" "}
                      {pedido.finalizado ? "Finalizado" : "Aberto"} / {pedido.itens.length} itens
                    </span>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export function AdminProductsPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cores, setCores] = useState<Cor[]>([]);
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [variacoesPorProduto, setVariacoesPorProduto] = useState<
    Record<number, ProdutoVariacao[]>
  >({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [produtoVariacaoAberto, setProdutoVariacaoAberto] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoriaId: "",
    imagemUrl: "",
    destaque: false,
  });
  const [variacaoForm, setVariacaoForm] = useState({
    corId: "",
    tamanhoId: "",
    disponivel: true,
  });
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [listaProdutos, listaCategorias, listaCores, listaTamanhos] = await Promise.all([
        listarProdutos(),
        listarCategorias(),
        listarCores(),
        listarTamanhos(),
      ]);
      setProdutos(listaProdutos);
      setCategorias(listaCategorias);
      setCores(listaCores);
      setTamanhos(listaTamanhos);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar produtos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limparForm() {
    setEditandoId(null);
    setForm({
      nome: "",
      descricao: "",
      preco: "",
      categoriaId: "",
      imagemUrl: "",
      destaque: false,
    });
  }

  function editar(produto: Produto) {
    setEditandoId(produto.id);
    setForm({
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      preco: String(produto.preco),
      categoriaId: String(produto.categoriaId ?? produto.categoria?.id ?? ""),
      imagemUrl: produto.imagens?.[0]?.imagemUrl ?? "",
      destaque: Boolean(produto.destaque),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    const payload = {
      nome: form.nome,
      descricao: form.descricao,
      preco: Number(form.preco),
      categoriaId: Number(form.categoriaId),
      destaque: form.destaque,
    };

    try {
      if (editandoId) {
        await atualizarProduto(editandoId, payload);
        setMensagem("Produto atualizado.");
      } else {
        await criarProduto({
          ...payload,
          imagemUrl: form.imagemUrl.trim() || undefined,
        });
        setMensagem("Produto cadastrado.");
      }

      limparForm();
      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar produto.");
    }
  }

  async function alternarDisponibilidade(produto: Produto) {
    try {
      await atualizarDisponibilidadeProduto(produto.id, !produto.disponivel);
      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao alterar disponibilidade.");
    }
  }

  async function remover(id: number) {
    setErro("");
    setMensagem("");

    try {
      await deletarProduto(id);
      setProdutos((lista) => lista.filter((produto) => produto.id !== id));
      setMensagem("Produto deletado.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao deletar produto.");
    }
  }

  async function abrirVariacoes(produtoId: number) {
    setErro("");
    setMensagem("");
    setProdutoVariacaoAberto((atual) => (atual === produtoId ? null : produtoId));

    try {
      const variacoes = await listarVariacoesProduto(produtoId);
      setVariacoesPorProduto((atual) => ({
        ...atual,
        [produtoId]: variacoes,
      }));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar variações.");
    }
  }

  async function criarVariacao(produtoId: number) {
    setErro("");
    setMensagem("");

    if (!variacaoForm.tamanhoId) {
      setErro("Selecione um tamanho para criar a variação.");
      return;
    }

    try {
      await criarVariacaoProduto(produtoId, {
        corId: variacaoForm.corId ? Number(variacaoForm.corId) : null,
        tamanhoId: Number(variacaoForm.tamanhoId),
        disponivel: variacaoForm.disponivel,
      });

      const variacoes = await listarVariacoesProduto(produtoId);
      setVariacoesPorProduto((atual) => ({
        ...atual,
        [produtoId]: variacoes,
      }));
      setVariacaoForm({
        corId: "",
        tamanhoId: "",
        disponivel: true,
      });
      setMensagem("Variação criada.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao criar variação.");
    }
  }

  async function alternarDisponibilidadeVariacao(variacao: ProdutoVariacao) {
    setErro("");
    setMensagem("");

    try {
      const atualizada = await atualizarDisponibilidadeVariacao(
        variacao.id,
        !variacao.disponivel
      );

      if (!variacao.produtoId) return;

      setVariacoesPorProduto((atual) => ({
        ...atual,
        [variacao.produtoId!]: (atual[variacao.produtoId!] ?? []).map((item) =>
          item.id === variacao.id
            ? { ...item, disponivel: atualizada.disponivel }
            : item
        ),
      }));
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao alterar disponibilidade da variação."
      );
    }
  }

  return (
    <main className="section admin-dashboard-page">
      <AdminNav />
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>Produtos</h1>
        </div>
      </div>

      {mensagem && <p className="success page-message">{mensagem}</p>}
      {erro && <p className="error page-message">{erro}</p>}

      <form className="admin-form-grid" onSubmit={salvar}>
        <label>
          Nome
          <input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} />
        </label>
        <label>
          Preço
          <input value={form.preco} onChange={(event) => setForm({ ...form, preco: event.target.value })} type="number" step="0.01" />
        </label>
        <label>
          Categoria
          <select value={form.categoriaId} onChange={(event) => setForm({ ...form, categoriaId: event.target.value })}>
            <option value="">Selecione</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>
        <label>
          Imagem URL
          <input disabled={Boolean(editandoId)} value={form.imagemUrl} onChange={(event) => setForm({ ...form, imagemUrl: event.target.value })} />
        </label>
        <label className="span-2">
          Descrição
          <textarea value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} />
        </label>
        <label className="admin-check">
          <input type="checkbox" checked={form.destaque} onChange={(event) => setForm({ ...form, destaque: event.target.checked })} />
          Destaque
        </label>
        <div className="table-actions">
          <button className="btn btn-primary" type="submit">
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button className="btn btn-outline" type="button" onClick={limparForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {carregando ? (
        <p className="status-text">Carregando produtos...</p>
      ) : (
        <div className="admin-list">
          {produtos.map((produto) => (
            <article className="admin-list-row" key={produto.id}>
              <div>
                <strong>{produto.nome}</strong>
                <span>
                  {produto.categoria?.nome ?? "Sem categoria"} /{" "}
                  {Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div className="table-actions">
                <button className="btn btn-outline" type="button" onClick={() => editar(produto)}>
                  Editar
                </button>
                <button className="btn btn-outline" type="button" onClick={() => alternarDisponibilidade(produto)}>
                  {produto.disponivel ? "Indisponível" : "Disponível"}
                </button>
                <button className="btn btn-outline" type="button" onClick={() => abrirVariacoes(produto.id)}>
                  Variações
                </button>
                <button className="btn btn-outline" type="button" onClick={() => remover(produto.id)}>
                  Deletar
                </button>
              </div>
              {produtoVariacaoAberto === produto.id && (
                <section className="variation-admin-panel">
                  <div className="variation-admin-form">
                    <label>
                      Cor
                      <select
                        value={variacaoForm.corId}
                        onChange={(event) =>
                          setVariacaoForm({
                            ...variacaoForm,
                            corId: event.target.value,
                          })
                        }
                      >
                        <option value="">Sem cor</option>
                        {cores.map((cor) => (
                          <option key={cor.id} value={cor.id}>
                            {cor.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Tamanho
                      <select
                        value={variacaoForm.tamanhoId}
                        onChange={(event) =>
                          setVariacaoForm({
                            ...variacaoForm,
                            tamanhoId: event.target.value,
                          })
                        }
                      >
                        <option value="">Selecione</option>
                        {tamanhos.map((tamanho) => (
                          <option key={tamanho.id} value={tamanho.id}>
                            {tamanho.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={variacaoForm.disponivel}
                        onChange={(event) =>
                          setVariacaoForm({
                            ...variacaoForm,
                            disponivel: event.target.checked,
                          })
                        }
                      />
                      Disponível
                    </label>

                    <button className="btn btn-primary" type="button" onClick={() => criarVariacao(produto.id)}>
                      Criar variação
                    </button>
                  </div>

                  <div className="variation-admin-list">
                    {(variacoesPorProduto[produto.id] ?? []).length === 0 ? (
                      <p className="status-text">Nenhuma variação cadastrada.</p>
                    ) : (
                      variacoesPorProduto[produto.id].map((variacao) => (
                        <article key={variacao.id}>
                          <div>
                            <strong>{variacao.tamanho?.nome ?? "Tamanho"}</strong>
                            <span>{variacao.cor?.nome ?? "Sem cor"}</span>
                          </div>
                          <button
                            className="btn btn-outline"
                            type="button"
                            onClick={() => alternarDisponibilidadeVariacao(variacao)}
                          >
                            {variacao.disponivel ? "Indisponível" : "Disponível"}
                          </button>
                        </article>
                      ))
                    )}
                  </div>
                </section>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

type CrudTipo = "categorias" | "cores" | "tamanhos";

export function AdminCrudPage({ tipo }: { tipo: CrudTipo }) {
  const [itens, setItens] = useState<Array<Categoria | Cor | Tamanho>>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [hex, setHex] = useState("#111111");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const config = useMemo(() => {
    if (tipo === "cores") {
      return {
        titulo: "Cores",
        listar: listarCores,
        criar: () => criarCor({ nome, hex }),
        atualizar: (id: number) => atualizarCor(id, { nome, hex }),
        deletar: deletarCor,
      };
    }

    if (tipo === "tamanhos") {
      return {
        titulo: "Tamanhos",
        listar: listarTamanhos,
        criar: () => criarTamanho(nome),
        atualizar: (id: number) => atualizarTamanho(id, nome),
        deletar: deletarTamanho,
      };
    }

    return {
      titulo: "Categorias",
      listar: listarCategorias,
      criar: () => criarCategoria(nome),
      atualizar: (id: number) => atualizarCategoria(id, nome),
      deletar: deletarCategoria,
    };
  }, [tipo, nome, hex]);

  async function carregar() {
    setErro("");

    try {
      setItens(await config.listar());
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao carregar dados.");
    }
  }

  useEffect(() => {
    carregar();
  }, [tipo]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setMensagem("");

    try {
      if (editandoId) {
        await config.atualizar(editandoId);
        setMensagem("Registro atualizado.");
      } else {
        await config.criar();
        setMensagem("Registro cadastrado.");
      }

      setEditandoId(null);
      setNome("");
      setHex("#111111");
      await carregar();
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao salvar registro.");
    }
  }

  async function remover(id: number) {
    setErro("");
    setMensagem("");

    try {
      await config.deletar(id);
      setItens((lista) => lista.filter((item) => item.id !== id));
      setMensagem("Registro deletado.");
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao deletar registro.");
    }
  }

  function editar(item: Categoria | Cor | Tamanho) {
    setEditandoId(item.id);
    setNome(item.nome);
    setHex("hex" in item && item.hex ? item.hex : "#111111");
  }

  return (
    <main className="section admin-dashboard-page">
      <AdminNav />
      <div className="section-heading">
        <div>
          <span className="eyebrow">Admin</span>
          <h1>{config.titulo}</h1>
        </div>
      </div>

      {mensagem && <p className="success page-message">{mensagem}</p>}
      {erro && <p className="error page-message">{erro}</p>}

      <form className="admin-form-grid compact-form" onSubmit={salvar}>
        <label>
          Nome
          <input value={nome} onChange={(event) => setNome(event.target.value)} />
        </label>
        {tipo === "cores" && (
          <label>
            Cor
            <input value={hex} onChange={(event) => setHex(event.target.value)} type="color" />
          </label>
        )}
        <div className="table-actions">
          <button className="btn btn-primary" type="submit">
            {editandoId ? "Atualizar" : "Cadastrar"}
          </button>
          {editandoId && (
            <button className="btn btn-outline" type="button" onClick={() => setEditandoId(null)}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="admin-list">
        {itens.map((item) => (
          <article className="admin-list-row" key={item.id}>
            <div>
              <strong>{item.nome}</strong>
              {"hex" in item && item.hex && <span>{item.hex}</span>}
            </div>
            <div className="table-actions">
              <button className="btn btn-outline" type="button" onClick={() => editar(item)}>
                Editar
              </button>
              <button className="btn btn-outline" type="button" onClick={() => remover(item.id)}>
                Deletar
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
