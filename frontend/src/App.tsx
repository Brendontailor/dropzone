import { AuthProvider } from "./auth/AuthContext";
import { Header } from "./components/Header";
import { ProtectedRoute } from "./components/ProtectedRoute";
import {
  AdminCrudPage,
  AdminInteractionsPage,
  AdminProductsPage,
} from "./pages/AdminPages";
import { CatalogPage } from "./pages/CatalogPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import {
  AdminPage,
  CartPage,
  FavoritesPage,
  InteractionsPage,
  ProductDetailPage,
} from "./pages/ProtectedPages";
import { RegisterPage } from "./pages/RegisterPage";

function Router() {
  const { pathname } = window.location;
  const produtoMatch = pathname.match(/^\/produtos\/(\d+)$/);

  if (pathname === "/") return <HomePage />;
  if (pathname === "/catalogo") return <CatalogPage />;
  if (pathname === "/login") return <LoginPage />;
  if (pathname === "/cadastro") return <RegisterPage />;

  if (produtoMatch) {
    return <ProductDetailPage id={produtoMatch[1]} />;
  }

  if (pathname === "/favoritos") {
    return (
      <ProtectedRoute>
        <FavoritesPage />
      </ProtectedRoute>
    );
  }

  if (pathname === "/carrinho") {
    return (
      <ProtectedRoute>
        <CartPage />
      </ProtectedRoute>
    );
  }

  if (pathname === "/interacoes") {
    return (
      <ProtectedRoute>
        <InteractionsPage />
      </ProtectedRoute>
    );
  }

  if (pathname === "/admin/produtos") {
    return (
      <ProtectedRoute admin>
        <AdminProductsPage />
      </ProtectedRoute>
    );
  }

  if (pathname === "/admin/interacoes") {
    return (
      <ProtectedRoute admin>
        <AdminInteractionsPage />
      </ProtectedRoute>
    );
  }

  if (pathname === "/admin/categorias") {
    return (
      <ProtectedRoute admin>
        <AdminCrudPage tipo="categorias" />
      </ProtectedRoute>
    );
  }

  if (pathname === "/admin/cores") {
    return (
      <ProtectedRoute admin>
        <AdminCrudPage tipo="cores" />
      </ProtectedRoute>
    );
  }

  if (pathname === "/admin/tamanhos") {
    return (
      <ProtectedRoute admin>
        <AdminCrudPage tipo="tamanhos" />
      </ProtectedRoute>
    );
  }

  if (pathname === "/admin") {
    return (
      <ProtectedRoute admin>
        <AdminPage />
      </ProtectedRoute>
    );
  }

  return (
    <main className="page-shell">
      <section className="empty-panel">
        <span className="eyebrow">404</span>
        <h1>Página não encontrada.</h1>
        <a className="btn btn-primary" href="/">
          Voltar para home
        </a>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Router />
    </AuthProvider>
  );
}
