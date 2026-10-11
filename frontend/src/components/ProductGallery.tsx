import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X, ZoomIn } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent, type SyntheticEvent, type WheelEvent } from "react";
import { createPortal } from "react-dom";
import type { Produto } from "../types";
import { escolherImagemFallback, obterImagemProduto } from "../utils/produtoImagem";
import "./ProductGallery.css";

interface ProductGalleryProps {
  produto: Produto;
}

/** Todas as fotografias cadastradas no produto, sem repetir a capa. */
export function ProductGallery({ produto }: ProductGalleryProps) {
  const imagens = useMemo(() => {
    const cadastradas = (produto.imagens ?? [])
      .map((imagem) => imagem.imagemUrl?.trim())
      .filter((url): url is string => Boolean(url));
    return Array.from(new Set(cadastradas.length ? cadastradas : [obterImagemProduto(produto)]));
  }, [produto]);

  const [indice, setIndice] = useState(0);
  const [aberta, setAberta] = useState(false);
  const [escala, setEscala] = useState(1);
  const [deslocamento, setDeslocamento] = useState({ x: 0, y: 0 });
  const arrasto = useRef<{ x: number; y: number; inicioX: number; inicioY: number } | null>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);
  const indiceAtual = Math.min(indice, imagens.length - 1);
  const fotoAtual = imagens[indiceAtual];
  const varias = imagens.length > 1;
  const imagemFallback = escolherImagemFallback(produto);

  const resetarZoom = () => {
    setEscala(1);
    setDeslocamento({ x: 0, y: 0 });
    arrasto.current = null;
  };

  const selecionar = (novoIndice: number) => {
    setIndice((novoIndice + imagens.length) % imagens.length);
    resetarZoom();
  };

  const ampliar = (passo: number) => {
    setEscala((anterior) => {
      const proximo = Math.max(1, Math.min(4, Math.round((anterior + passo) * 100) / 100));
      if (proximo === 1) setDeslocamento({ x: 0, y: 0 });
      return proximo;
    });
  };

  useEffect(() => {
    setIndice(0);
    setAberta(false);
    setEscala(1);
    setDeslocamento({ x: 0, y: 0 });
  }, [produto.id]);

  useEffect(() => {
    if (!aberta) return;
    const overflowAntigo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();

    function teclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setAberta(false);
      } else if (evento.key === "ArrowRight" && varias) {
        evento.preventDefault();
        setIndice((anterior) => (anterior + 1) % imagens.length);
        setEscala(1);
        setDeslocamento({ x: 0, y: 0 });
      } else if (evento.key === "ArrowLeft" && varias) {
        evento.preventDefault();
        setIndice((anterior) => (anterior - 1 + imagens.length) % imagens.length);
        setEscala(1);
        setDeslocamento({ x: 0, y: 0 });
      } else if (evento.key === "+" || evento.key === "=") {
        evento.preventDefault();
        setEscala((anterior) => Math.min(4, anterior + 0.5));
      } else if (evento.key === "-" || evento.key === "_") {
        evento.preventDefault();
        setEscala((anterior) => Math.max(1, anterior - 0.5));
      } else if (evento.key === "0") {
        setEscala(1);
        setDeslocamento({ x: 0, y: 0 });
      }
    }

    window.addEventListener("keydown", teclado);
    return () => {
      document.body.style.overflow = overflowAntigo;
      window.removeEventListener("keydown", teclado);
      abrirRef.current?.focus();
    };
  }, [aberta, imagens.length, varias]);

  function aoFalharImagem(evento: SyntheticEvent<HTMLImageElement>) {
    const imagem = evento.currentTarget;
    if (!imagem.src.endsWith(imagemFallback)) imagem.src = imagemFallback;
  }

  function iniciarArrasto(evento: PointerEvent<HTMLDivElement>) {
    if (escala <= 1) return;
    if (evento.target instanceof Element && evento.target.closest("button")) return;
    if (evento.pointerType === "mouse" && evento.button !== 0) return;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    arrasto.current = {
      x: evento.clientX,
      y: evento.clientY,
      inicioX: deslocamento.x,
      inicioY: deslocamento.y,
    };
  }

  function moverArrasto(evento: PointerEvent<HTMLDivElement>) {
    if (!arrasto.current) return;
    setDeslocamento({
      x: arrasto.current.inicioX + evento.clientX - arrasto.current.x,
      y: arrasto.current.inicioY + evento.clientY - arrasto.current.y,
    });
  }

  function rolagemZoom(evento: WheelEvent<HTMLDivElement>) {
    // Modal com scroll do body bloqueado; o React registra wheel como passive.
    ampliar(evento.deltaY < 0 ? 0.25 : -0.25);
  }

  const controlesMiniatura = (modo: "pagina" | "modal") => (
    <div className={`dz-pgallery-thumbs dz-pgallery-thumbs--${modo}`} aria-label="Fotografias do produto">
      {imagens.map((url, numero) => (
        <button
          key={`${url}-${numero}`}
          type="button"
          className={`dz-pgallery-thumb${indiceAtual === numero ? " is-active" : ""}`}
          onClick={() => selecionar(numero)}
          aria-label={`Ver foto ${numero + 1} de ${imagens.length}`}
          aria-pressed={indiceAtual === numero}
          title={`Foto ${numero + 1}`}
        >
          <img src={url} alt="" loading={numero > 3 ? "lazy" : "eager"} onError={aoFalharImagem} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="dz-pgallery">
      <div className="dz-pgallery-stage">
        <button
          type="button"
          className="dz-pgallery-open"
          ref={abrirRef}
          onClick={() => { resetarZoom(); setAberta(true); }}
          aria-label={`Ampliar foto ${indiceAtual + 1} de ${imagens.length} de ${produto.nome}`}
          title="Clique para ampliar"
        >
          <img src={fotoAtual} alt={`${produto.nome}, foto ${indiceAtual + 1}`} onError={aoFalharImagem} />
          <span className="dz-pgallery-zoom-cta"><ZoomIn size={18} /> Ampliar</span>
        </button>
        {produto.destaque && <span className="dz-pgallery-badge">Destaque</span>}
        {varias && (
          <>
            <button type="button" className="dz-pgallery-arrow dz-pgallery-arrow--prev" onClick={() => selecionar(indiceAtual - 1)} aria-label="Foto anterior"><ChevronLeft size={22} /></button>
            <button type="button" className="dz-pgallery-arrow dz-pgallery-arrow--next" onClick={() => selecionar(indiceAtual + 1)} aria-label="Próxima foto"><ChevronRight size={22} /></button>
            <span className="dz-pgallery-count">{indiceAtual + 1} / {imagens.length}</span>
          </>
        )}
      </div>
      {varias && controlesMiniatura("pagina")}
      <p className="dz-pgallery-hint"><Maximize2 size={14} /> Clique na imagem para ampliar os detalhes</p>

      {aberta && createPortal(
        <div className="dz-pgallery-overlay" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) setAberta(false); }}>
          <section className="dz-pgallery-dialog" role="dialog" aria-modal="true" aria-label={`Galeria ampliada: ${produto.nome}`}>
            <header className="dz-pgallery-topbar">
              <div className="dz-pgallery-modal-title"><span>DROPZONE / GALERIA</span><strong>{produto.nome}</strong></div>
              <div className="dz-pgallery-toolbar">
                <span className="dz-pgallery-modal-count">{indiceAtual + 1} / {imagens.length}</span>
                <button type="button" onClick={() => ampliar(-0.5)} disabled={escala <= 1} aria-label="Diminuir zoom" title="Diminuir zoom"><Minus size={19} /></button>
                <span className="dz-pgallery-scale" aria-live="polite">{Math.round(escala * 100)}%</span>
                <button type="button" onClick={() => ampliar(0.5)} disabled={escala >= 4} aria-label="Aumentar zoom" title="Aumentar zoom"><Plus size={19} /></button>
                <button type="button" onClick={resetarZoom} disabled={escala === 1} aria-label="Restaurar zoom" title="Restaurar zoom"><Maximize2 size={18} /></button>
                <button className="dz-pgallery-close" type="button" ref={fecharRef} onClick={() => setAberta(false)} aria-label="Fechar galeria" title="Fechar (Esc)"><X size={22} /></button>
              </div>
            </header>
            <div
              className={`dz-pgallery-viewer${escala > 1 ? " is-zoomed" : ""}`}
              onPointerDown={iniciarArrasto}
              onPointerMove={moverArrasto}
              onPointerUp={() => { arrasto.current = null; }}
              onPointerCancel={() => { arrasto.current = null; }}
              onWheel={rolagemZoom}
              onDoubleClick={() => { if (escala > 1) resetarZoom(); else ampliar(1); }}
            >
              <img
                key={fotoAtual}
                src={fotoAtual}
                alt={`${produto.nome}, foto ampliada ${indiceAtual + 1}`}
                draggable={false}
                onError={aoFalharImagem}
                style={{ transform: `translate(${deslocamento.x}px, ${deslocamento.y}px) scale(${escala})` }}
              />
              {varias && <>
                <button type="button" className="dz-pgallery-modal-arrow is-prev" onClick={() => selecionar(indiceAtual - 1)} aria-label="Foto anterior"><ChevronLeft size={28} /></button>
                <button type="button" className="dz-pgallery-modal-arrow is-next" onClick={() => selecionar(indiceAtual + 1)} aria-label="Próxima foto"><ChevronRight size={28} /></button>
              </>}
            </div>
            <footer className="dz-pgallery-modal-footer">
              {varias ? controlesMiniatura("modal") : <span>Imagem do produto</span>}
              <span className="dz-pgallery-help">Roda do mouse para zoom · Arraste para mover · ← → para trocar · Esc para fechar</span>
            </footer>
          </section>
        </div>, document.body
      )}
    </div>
  );
}
