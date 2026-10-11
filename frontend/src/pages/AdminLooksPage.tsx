import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, ChevronDown, ChevronUp, ImagePlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { AdminNav } from "./AdminPages";
import { atualizarLook, criarLook, excluirLook, imagemLookUrl, listarLooksAdmin, type LookPayload } from "../api/looks";
import { listarProdutos } from "../api/produtos";
import { uploadImagemProduto } from "../api/admin";
import { obterImagemProduto } from "../utils/produtoImagem";
import type { Look, Produto } from "../types";

const vazio = (): LookPayload => ({ nome: "", descricao: "", imagemUrl: "", ordem: 0, publicado: true, produtoIds: [] });

export function AdminLooksPage() {
  const [looks, setLooks] = useState<Look[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState<LookPayload>(vazio);
  const [editando, setEditando] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [visualizacao, setVisualizacao] = useState<string | null>(null);

  async function carregar() {
    setCarregando(true);
    try {
      const [listaLooks, listaProdutos] = await Promise.all([listarLooksAdmin(), listarProdutos()]);
      setLooks(listaLooks);
      setProdutos(listaProdutos);
    } catch (e) { setErro(e instanceof Error ? e.message : "Não foi possível carregar os looks."); }
    finally { setCarregando(false); }
  }
  useEffect(() => { void carregar(); }, []);
  useEffect(() => {
    if (!arquivo) { setVisualizacao(null); return; }
    const url = URL.createObjectURL(arquivo);
    setVisualizacao(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  function limpar() { setForm(vazio()); setEditando(null); setArquivo(null); setBusca(""); }
  function editar(look: Look) {
    setEditando(look.id);
    setForm({ nome: look.nome, descricao: look.descricao, imagemUrl: look.imagemUrl, ordem: look.ordem, publicado: look.publicado, produtoIds: look.itens.map(item => item.produtoId) });
    setArquivo(null); setMensagem(""); setErro("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function alternarProduto(id: number) {
    setForm(atual => ({ ...atual, produtoIds: atual.produtoIds.includes(id) ? atual.produtoIds.filter(item => item !== id) : [...atual.produtoIds, id] }));
  }
  function mover(id: number, deslocamento: number) {
    setForm(atual => {
      const nova = [...atual.produtoIds]; const origem = nova.indexOf(id); const destino = origem + deslocamento;
      if (origem < 0 || destino < 0 || destino >= nova.length) return atual;
      [nova[origem], nova[destino]] = [nova[destino], nova[origem]];
      return { ...atual, produtoIds: nova };
    });
  }
  const porId = useMemo(() => new Map(produtos.map(item => [item.id, item])), [produtos]);
  const filtrados = useMemo(() => produtos.filter(item => `${item.nome} ${item.categoria?.nome ?? ""}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR"))), [produtos, busca]);

  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (!form.imagemUrl.trim() && !arquivo) { setErro("Adicione uma imagem para o look."); return; }
    if (!form.produtoIds.length) { setErro("Selecione pelo menos um produto real do catálogo."); return; }
    setErro(""); setMensagem(""); setSalvando(true);
    try {
      const imagemUrl = arquivo ? (await uploadImagemProduto(arquivo)).url : form.imagemUrl;
      const payload = { ...form, imagemUrl, nome: form.nome.trim(), descricao: form.descricao.trim() };
      if (editando) await atualizarLook(editando, payload);
      else await criarLook(payload);
      limpar();
      await carregar();
      setMensagem(editando ? "Look atualizado no editorial e no catálogo." : "Look criado e publicado no editorial.");
    } catch (e) { setErro(e instanceof Error ? e.message : "Erro ao salvar look."); }
    finally { setSalvando(false); }
  }
  async function remover(look: Look) {
    if (!window.confirm(`Excluir o look “${look.nome}”? Os produtos continuarão no catálogo.`)) return;
    setErro(""); setMensagem("");
    try { await excluirLook(look.id); if (editando === look.id) limpar(); await carregar(); setMensagem("Look excluído. Nenhum produto foi apagado."); }
    catch (e) { setErro(e instanceof Error ? e.message : "Erro ao excluir look."); }
  }

  return (
    <main className="section admin-dashboard-page dz-looks-admin">
      <AdminNav />
      <header className="section-heading">
        <div><span className="eyebrow">ADMIN / EDITORIAL</span><h1>Looks da coleção</h1><p>Crie, edite e vincule peças reais. Alterações aparecem na vitrine sem mexer no código.</p></div>
        {editando && <button type="button" className="btn btn-outline" onClick={limpar}><Plus size={16} /> Novo look</button>}
      </header>
      {erro && <p className="error page-message" role="alert">{erro}</p>}
      {mensagem && <p className="success page-message" role="status">{mensagem}</p>}
      <div className="dz-look-editor-layout">
        <form className="dz-look-form" onSubmit={salvar}>
          <div className="dz-look-form-heading"><span className="eyebrow">{editando ? `EDITANDO LOOK #${editando}` : "NOVO VISUAL"}</span><h2>{editando ? "Personalizar look" : "Montar um look"}</h2></div>
          <div className="dz-look-form-fields">
            <label>Nome do look<input required maxLength={100} value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Concrete Night" /></label>
            <label>Ordem na vitrine<input type="number" min="0" max="999" value={form.ordem} onChange={e => setForm({ ...form, ordem: Number(e.target.value) })} /></label>
            <label className="dz-span-all">Descrição<textarea rows={2} maxLength={300} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva o visual em uma frase." /></label>
            <label className="dz-span-all">Imagem do look (URL ou caminho local)<input value={form.imagemUrl} onChange={e => setForm({ ...form, imagemUrl: e.target.value })} placeholder="/colecao/modelos/look-01.webp" /></label>
          </div>
          <label className="dz-look-upload"><ImagePlus size={18} /> <span>{arquivo ? arquivo.name : "Ou envie uma nova imagem de capa"}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setArquivo(e.target.files?.[0] ?? null)} /></label>
          {(visualizacao || form.imagemUrl) && <img className="dz-look-preview" src={visualizacao || imagemLookUrl(form.imagemUrl)} alt="Prévia da capa do look" />}
          <label className="dz-look-switch"><input type="checkbox" checked={form.publicado} onChange={e => setForm({ ...form, publicado: e.target.checked })} /> Publicar look na loja</label>
          <div className="dz-look-form-heading"><span className="eyebrow">PRODUTOS VINCULADOS</span><h3>{form.produtoIds.length} peça(s) selecionada(s)</h3><p>A ordem abaixo define a sequência das roupas ao abrir o look.</p></div>
          <div className="dz-look-selected">
            {!form.produtoIds.length && <p className="status-text">Selecione as peças na lista ao lado.</p>}
            {form.produtoIds.map((id, index) => { const produto = porId.get(id); return <div className="dz-selected-product" key={id}>
              {produto && <img src={obterImagemProduto(produto)} alt="" />}
              <div><strong>{produto?.nome ?? `Produto #${id}`}</strong><small>{index + 1}º item · {produto ? Number(produto.preco).toLocaleString("pt-BR", {style:"currency", currency:"BRL"}) : "Não encontrado"}</small></div>
              <div className="dz-selected-actions"><button type="button" aria-label="Mover para cima" disabled={index===0} onClick={() => mover(id, -1)}><ChevronUp size={16}/></button><button type="button" aria-label="Mover para baixo" disabled={index===form.produtoIds.length-1} onClick={() => mover(id, 1)}><ChevronDown size={16}/></button><button type="button" aria-label="Remover peça" onClick={() => alternarProduto(id)}><X size={16}/></button></div>
            </div>; })}
          </div>
          <div className="dz-form-actions"><button className="btn btn-primary" disabled={salvando} type="submit"><Check size={17} /> {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Criar look"}</button><button className="btn btn-outline" type="button" onClick={limpar}>Limpar</button></div>
        </form>
        <aside className="dz-look-picker"><div className="dz-look-form-heading"><span className="eyebrow">SELEÇÃO DE PEÇAS</span><h2>Catálogo</h2><p>Marque os produtos que compõem o look. Você pode combinar itens de qualquer categoria.</p></div>
          <input className="dz-look-search" value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou categoria..." />
          <div className="dz-look-picker-list">
            {carregando ? <p className="status-text">Carregando...</p> : filtrados.length ? filtrados.map(produto => { const selected=form.produtoIds.includes(produto.id); return <label key={produto.id} className={`dz-picker-item ${selected ? "is-selected" : ""}`}><input type="checkbox" checked={selected} onChange={() => alternarProduto(produto.id)} /><img src={obterImagemProduto(produto)} alt="" loading="lazy"/><span><strong>{produto.nome}</strong><small>{produto.categoria?.nome ?? "Sem categoria"} · {Number(produto.preco).toLocaleString("pt-BR", {style:"currency", currency:"BRL"})}</small></span>{selected && <Check size={18} className="dz-picker-check" />}</label>; }) : <p className="status-text">Nenhuma peça encontrada.</p>}
          </div>
        </aside>
      </div>
      <section className="dz-looks-current"><div className="section-heading"><div><span className="eyebrow">VITRINE</span><h2>Looks cadastrados ({looks.length})</h2></div></div>
        {carregando ? <p className="status-text">Carregando...</p> : !looks.length ? <p className="status-text">Nenhum look cadastrado. Vá até Produtos e importe o Novo Lote ou crie seu primeiro look acima.</p> : <div className="dz-admin-look-grid">{looks.map(look => <article className="dz-admin-look-card" key={look.id}>
          <img src={imagemLookUrl(look.imagemUrl)} alt={`Look ${look.nome}`} loading="lazy" />
          <div><small>{look.publicado ? "PUBLICADO" : "RASCUNHO"} · POSIÇÃO {look.ordem}</small><h3>{look.nome}</h3><p>{look.descricao}</p><span>{look.itens.length} peça(s) vinculada(s)</span><div className="dz-admin-look-actions"><button type="button" className="btn btn-outline" onClick={() => editar(look)}><Pencil size={14}/> Editar</button><button type="button" className="btn btn-outline" onClick={() => remover(look)}><Trash2 size={14}/> Excluir</button></div></div>
        </article>)}</div>}
      </section>
    </main>
  );
}
