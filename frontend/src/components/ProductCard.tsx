import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import {
  adicionarFavorito,
  listarFavoritos,
  removerFavorito,
} from "../api/favoritos";
import { useAuth } from "../auth/AuthContext";
import type { Produto, ProdutoImagem } from "../types";
import { escolherImagemFallback, obterImagemProduto } from "../utils/produtoImagem";

interface ProductCardProps {
  produto: Produto;
  modoHome?: boolean;
}

export function ProductCard({ produto, modoHome = false }: ProductCardProps) {
  const { estaLogado } = useAuth();
  const [favoritado, setFavoritado] = useState(false);
  const [carregandoFavorito, setCarregandoFavorito] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(0);
  const [imagemComErro, setImagemComErro] = useState(false);
  const [imagensCarregadas, setImagensCarregadas] = useState<string[]>([]);

  const imagens = produto.imagens?.map((img: ProdutoImagem) => img.imagemUrl) ?? [];
  const imagemPrincipal = obterImagemProduto(produto);
  const todasImagens = imagens.length > 0 ? [imagemPrincipal, ...imagens.filter((img) => img !== imagemPrincipal)] : [imagemPrincipal];
  const imagemAtual = imagemComErro ? escolherImagemFallback(produto) : todasImagens[hoverIndex] ?? imagemPrincipal;

  const preco = Number(produto.preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  useEffect(() => {
    if (todasImagens.length > 1) {
      const precarregar = todasImagens.slice(1).map((src) => {
        const img = new Image();
        img.src = src;
        return new Promise((resolve) => { img.onload = img.onerror = resolve; });
      });
      Promise.all(precarregar).then(() => setImagensCarregadas(todasImagens));
    } else {
      setImagensCarregadas(todasImagens);
    }
  }, [todasImagens]);

  useEffect(() => {
    if (!estaLogado) {
      setFavoritado(false);
      return;
    }

    let ativo = true;

    listarFavoritos()
      .then((favoritos) => {
        if (!ativo) return;
        setFavoritado(
          favoritos.some((favorito) => favorito.produtoId === produto.id)
        );
      })
      .catch(() => {
        if (ativo) setFavoritado(false);
      });

    return () => {
      ativo = false;
    };
  }, [estaLogado, produto.id]);

  async function alternarFavorito() {
    if (!estaLogado) {
      window.location.href = "/login";
      return;
    }

    setCarregandoFavorito(true);

    try {
      if (favoritado) {
        await removerFavorito(produto.id);
        setFavoritado(false);
      } else {
        await adicionarFavorito(produto.id);
        setFavoritado(true);
      }
    } catch {
      setFavoritado((estadoAtual) => estadoAtual);
    } finally {
      setCarregandoFavorito(false);
    }
  }

  const handleMouseEnter = () => {
    if (todasImagens.length > 1) {
      setHoverIndex(1);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(0);
  };

  const handleImageError = () => {
    if (hoverIndex > 0 && hoverIndex < todasImagens.length - 1) {
      setHoverIndex((prev) => prev + 1);
    } else {
      setImagemComErro(true);
    }
  };

  return (
    <article
      className={modoHome ? "product-card product-card-home" : "product-card"}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="product-media">
        <a href={`/produtos/${produto.id}`}>
          <img
            src={imagemAtual}
            alt={produto.nome}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            style={{ transition: "opacity 200ms ease" }}
          />
        </a>

        {produto.destaque && <span className="badge">Destaque</span>}

        {todasImagens.length > 1 && imagensCarregadas.length > 1 && (
          <span className="hover-indicator" aria-hidden="true">
            {hoverIndex + 1} / {todasImagens.length}
          </span>
        )}

        <button
          className={favoritado ? "favorite-btn active" : "favorite-btn"}
          type="button"
          disabled={carregandoFavorito}
          aria-label={
            favoritado
              ? `Remover ${produto.nome} dos favoritos`
              : `Favoritar ${produto.nome}`
          }
          aria-pressed={favoritado}
          onClick={alternarFavorito}
        >
          <Heart size={18} fill={favoritado ? "currentColor" : "none"} />
        </button>
      </div>

      <a className="product-info" href={`/produtos/${produto.id}`}>
        <small className="product-category">{produto.categoria?.nome ?? "DropZone"}</small>
        <strong>{produto.nome}</strong>

        {!modoHome && <p className="product-description">{produto.descricao}</p>}

        {!modoHome && (
          <div className="color-dots" aria-label="Cores disponíveis">
            {produto.variacoes?.slice(0, 4).map((variacao) => (
              <span
                key={variacao.id}
                title={variacao.cor?.nome ?? "Cor"}
                style={{ background: variacao.cor?.hex ?? "#202020" }}
              />
            ))}
          </div>
        )}

        <div className="product-footer">
          <strong>{preco}</strong>
          <span>{Number(produto.mediaAvaliacoes ?? 0).toFixed(1)} ★</span>
        </div>
      </a>
    </article>
  );
}
