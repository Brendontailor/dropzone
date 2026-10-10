export type Role = "CLIENTE" | "ADMIN";

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface ProdutoImagem {
  id: number;
  imagemUrl: string;
  corId?: number | null;
}

export interface Cor {
  id: number;
  nome: string;
  hex?: string | null;
}

export interface Tamanho {
  id: number;
  nome: string;
}

export interface ProdutoVariacao {
  id: number;
  produtoId?: number;
  corId?: number | null;
  tamanhoId?: number;
  disponivel: boolean;
  cor?: Cor | null;
  tamanho?: Tamanho;
}

export interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  preco: string | number;
  disponivel?: boolean;
  destaque?: boolean;
  categoriaId?: number;
  categoria?: Categoria;
  imagens?: ProdutoImagem[];
  variacoes?: ProdutoVariacao[];
  mediaAvaliacoes?: number;
  totalAvaliacoes?: number;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Avaliacao {
  id: number;
  nota: number;
  comentario?: string | null;
  respostaAdmin?: string | null;
  produtoId: number;
  usuarioId: number;
  criadoEm?: string;
  usuario?: Pick<Usuario, "id" | "nome" | "email">;
  produto?: Pick<Produto, "id" | "nome">;
}

export interface Favorito {
  id: number;
  produtoId: number;
  usuarioId: number;
  produto?: Produto;
  usuario?: Pick<Usuario, "id" | "nome" | "email">;
}

export interface ItemCarrinho {
  id: number;
  quantidade: number;
  produtoVariacaoId: number;
  produtoVariacao: ProdutoVariacao & {
    produto: Produto;
    cor?: Cor | null;
    tamanho: Tamanho;
  };
}

export interface Carrinho {
  id: number;
  finalizado: boolean;
  usuarioId: number;
  usuario?: Pick<Usuario, "id" | "nome" | "email">;
  itens: ItemCarrinho[];
}

export interface PedidoWhatsapp {
  carrinhoId: number;
  mensagem: string;
  whatsappUrl: string;
  total: number;
}

export interface InteracoesUsuario {
  favoritos: Favorito[];
  avaliacoes: Avaliacao[];
  carrinhos: Carrinho[];
}

export interface SugestaoIA {
  produtoBase?: {
    id: number;
    nome: string;
  };
  explicacao?: string;
  sugestoes?: Array<{
    produtoId: number;
    nome: string;
    motivo: string;
  }>;
  geradoPorIA?: boolean;
  fonte?: string;
}

export interface DashboardAdmin {
  totais: {
    produtos: number;
    clientes: number;
    avaliacoes: number;
    favoritos: number;
    pedidosFinalizados: number;
  };
  produtosMaisFavoritados: Array<{
    id: number;
    nome: string;
    imagemUrl?: string | null;
    totalFavoritos: number;
  }>;
  produtosMelhorAvaliados: Array<{
    id: number;
    nome: string;
    imagemUrl?: string | null;
    mediaAvaliacao: number;
    totalAvaliacoes: number;
  }>;
}
