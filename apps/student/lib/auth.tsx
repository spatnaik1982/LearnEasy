import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const tok = localStorage.getItem("learn-easy-token");
    if (tok) return tok;
    // Auto-login for dev/demo: get a real JWT from API
    fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test2@test.com", password: "test123", role: "student" }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.access_token) {
          localStorage.setItem("learn-easy-token", d.access_token);
          window.location.reload();
        }
      })
      .catch(() => {});
    return null;
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem("learn-easy-token", token);
    } else {
      localStorage.removeItem("learn-easy-token");
    }
  } catch {
    /* noop */
  }
}

function decodeToken(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return { id: decoded.sub, name: decoded.name, email: decoded.email };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(false);

  const user = token ? decodeToken(token) : null;

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 500));

      const mockToken = [
        btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
        btoa(JSON.stringify({ sub: "student-1", name: "Alex", email })),
        btoa(JSON.stringify({ sig: "mock-signature" })),
      ].join(".");

      setStoredToken(mockToken);
      setToken(mockToken);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}