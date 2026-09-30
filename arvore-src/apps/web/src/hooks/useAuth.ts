import { useState, useEffect } from "react";

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  isAdmin: boolean;
  userId?: number;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: true, authenticated: false, isAdmin: false });

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setState({ loading: false, authenticated: !!data.authenticated, isAdmin: !!data.isAdmin, userId: data.userId }))
      .catch(() => setState({ loading: false, authenticated: false, isAdmin: false }));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao entrar");
    setState({ loading: false, authenticated: true, isAdmin: !!data.user.isAdmin, userId: data.user.id });
    return data.user;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setState({ loading: false, authenticated: false, isAdmin: false });
  };

  return { ...state, login, logout };
}
