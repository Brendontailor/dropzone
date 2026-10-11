import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useNavigation } from "../components/NavigationContext";
import { Edit, Trash2 } from "lucide-react";
import { importarNovoLote } from "../api/looks";
import {
  excluirAvaliacaoAdmin,
  listarAvaliacoesAdmin,
  listarFavoritosAdmin,
  listarPedidosAdmin,
  responderAvaliacaoAdmin,
  uploadImagemProduto,
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
  const { navigate, pathname } = useNavigation();

  const tabs = [
    { path: "/admin", label: "Dashboard" },
    { path: "/admin/produtos", label: "Produtos" },
    { path: "/admin/looks", label: "Looks" },
    { path: "/admin/interacoes", label: "Interações" },
    { path: "/admin/categorias", label: "Categorias" },
    { path: "/admin/cores", label: "Cores" },
    { path: "/admin/tamanhos", label: "Tamanhos" },
  ];

  return (
    <nav className="admin-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.path}
          type="button"
          className={pathname === tab.path ? "active" : ""}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </button>
      ))}
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
    destaque: false,
  });
  const [imagensExistentes, setImagensExistentes] = useState<string[]>([]);
  const [imagemPreviews, setImagemPreviews] = useState<Array<{ file: File; url: string }>>([]);
  const previewsTemporariosRef = useRef<string[]>([]);
  const [uploadandoImagem, setUploadandoImagem] = useState(false);
  const [variacaoForm, setVariacaoForm] = useState({
    corId: "",
    tamanhoId: "",
    disponivel: true,
  });
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [importando, setImportando] = useState(false);

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

  useEffect(() => () => {
    previewsTemporariosRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewsTemporariosRef.current = [];
  }, []);

  function limparPreviewsTemporarios() {
    previewsTemporariosRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewsTemporariosRef.current = [];
    setImagemPreviews([]);
  }

  function removerPreviewTemporario(url: string) {
    URL.revokeObjectURL(url);
    previewsTemporariosRef.current = previewsTemporariosRef.current.filter((item) => item !== url);
    setImagemPreviews((lista) => lista.filter((imagem) => imagem.url !== url));
  }

  function limparForm() {
    limparPreviewsTemporarios();
    setEditandoId(null);
    setForm({
      nome: "",
      descricao: "",
      preco: "",
      categoriaId: "",
      destaque: false,
    });
    setImagensExistentes([]);
  }

  function editar(produto: Produto) {
    limparPreviewsTemporarios();
    setEditandoId(produto.id);
    setImagensExistentes(
      (produto.imagens ?? [])
        .map((imagem) => imagem.imagemUrl)
        .filter((url): url is string => Boolean(url))
    );
    setForm({
      nome: produto.nome,
      descricao: produto.descricao ?? "",
      preco: String(produto.preco),
      categoriaId: String(produto.categoriaId ?? produto.categoria?.id ?? ""),
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
      const imagensUrlsFinais = [...imagensExistentes];

      if (imagemPreviews.length > 0) {
        setUploadandoImagem(true);
        try {
          const uploads = await Promise.all(
            imagemPreviews.map(({ file }) => uploadImagemProduto(file))
          );
          imagensUrlsFinais.push(...uploads.map((upload) => upload.url));
        } finally {
          setUploadandoImagem(false);
        }
      }

      const payloadComImagens = {
        ...payload,
        imagemUrls: imagensUrlsFinais,
        imagemUrl: imagensUrlsFinais[0],
      };

      if (editandoId) {
        await atualizarProduto(editandoId, payloadComImagens);
        setMensagem(`Produto atualizado com ${imagensUrlsFinais.length} foto(s).`);
      } else {
        await criarProduto(payloadComImagens);
        setMensagem(`Produto cadastrado com ${imagensUrlsFinais.length} foto(s).`);
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

  async function importar() {
    if (!window.confirm("Importar 20 novos produtos, 35 fotos e 6 looks? Os registros já importados não serão duplicados nem terão seus ajustes sobrescritos.")) return;
    setImportando(true);
    setErro("");
    setMensagem("");
    try {
      const resultado = await importarNovoLote();
      await carregar();
      setMensagem(`Lote conferido: ${resultado.produtosCriados} produto(s) criado(s), ${resultado.produtosExistentes} já existente(s), ${resultado.fotosAdicionadas} foto(s) nova(s), ${resultado.variacoesAdicionadas} variação(ões) nova(s), ${resultado.looksCriados} look(s) novo(s).`);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Erro ao importar o lote.");
    } finally {
      setImportando(false);
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

      <div className="dz-import-strip">
        <div>
          <span className="eyebrow">NOVO LOTE / 10.10.2026</span>
          <h2>20 produtos · 35 fotos · 6 looks</h2>
          <p>Importe as peças com tamanhos e preços iniciais. Confira os valores e a disponibilidade antes de vender.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={importar} disabled={importando}>
          {importando ? "Importando..." : "Importar Novo Lote"}
        </button>
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
        <div className="dz-product-upload-field">
          <label htmlFor="produto-imagens">Fotos do produto</label>
          <div className="imagem-upload dz-multi-image-upload">
            <p>Selecione várias fotos de uma vez. No cadastro, todas serão salvas na galeria do produto.</p>
            <input
              id="produto-imagens"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => {
                const arquivos = Array.from(event.currentTarget.files ?? []);
                if (arquivos.length > 0) {
                  const novosPreviews = arquivos.map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
                  }));
                  previewsTemporariosRef.current.push(...novosPreviews.map((imagem) => imagem.url));
                  setImagemPreviews((atuais) => [...atuais, ...novosPreviews]);
                }
                event.currentTarget.value = "";
              }}
              disabled={uploadandoImagem}
            />
            {(imagensExistentes.length > 0 || imagemPreviews.length > 0) && (
              <div className="dz-product-image-grid">
                {imagensExistentes.map((url, index) => (
                  <article className="dz-product-image-tile" key={`existente-${index}-${url}`}>
                    <img src={url} alt={`Foto salva ${index + 1}`} />
                    <span>{index === 0 ? "Foto principal" : `Foto ${index + 1}`} · salva</span>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setImagensExistentes((atuais) => atuais.filter((_, i) => i !== index))}
                      disabled={uploadandoImagem}
                    >Remover</button>
                  </article>
                ))}
                {imagemPreviews.map((imagem, index) => (
                  <article className="dz-product-image-tile" key={imagem.url}>
                    <img src={imagem.url} alt={`Nova foto ${index + 1}`} />
                    <span>{imagensExistentes.length + index === 0 ? "Foto principal" : "Nova foto"}</span>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => removerPreviewTemporario(imagem.url)}
                      disabled={uploadandoImagem}
                    >Remover</button>
                  </article>
                ))}
              </div>
            )}
            {uploadandoImagem && <span className="upload-status">Enviando fotos...</span>}
          </div>
        </div>
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
                <div className="admin-product-image">
                  {produto.imagens?.[0]?.imagemUrl ? (
                    <img
                      src={produto.imagens[0].imagemUrl}
                      alt={produto.nome}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span className="no-image">Sem imagem</span>
                  )}
                </div>
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

      <form className="admin-form-grid crud-form" onSubmit={salvar}>
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
          <article className="admin-list-row admin-list-row--crud" key={item.id}>
            <div className="admin-list-row__content">
              <strong>{item.nome}</strong>
              {"hex" in item && item.hex && <span>{item.hex}</span>}
            </div>
            <div className="table-actions">
              <button className="btn btn-action btn-action--edit" type="button" onClick={() => editar(item)} aria-label={`Editar ${item.nome}`}>
                <Edit size={14} aria-hidden="true" />
                <span>Editar</span>
              </button>
              <button className="btn btn-action btn-action--delete" type="button" onClick={() => remover(item.id)} aria-label={`Deletar ${item.nome}`}>
                <Trash2 size={14} aria-hidden="true" />
                <span>Deletar</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
