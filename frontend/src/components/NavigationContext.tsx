import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface NavContextType {
  pathname: string;
  navigate: (path: string) => void;
}

const NavContext = createContext<NavContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    function onPopState() {
      setPathname(window.location.pathname);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setPathname(path);
  };

  return (
    <NavContext.Provider value={{ pathname, navigate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}