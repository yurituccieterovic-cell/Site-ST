import { useState } from "react";

interface Props {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      padding: 24,
    }}>
      <div style={{
        width: "100%",
        maxWidth: 380,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 32,
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>🌳 Árvore Oracular</h1>
        <p style={{ color: "var(--muted)", marginBottom: 24, fontSize: 14 }}>
          Memória persistente. Múltiplas vozes.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            style={{ width: "100%" }}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%" }}
          />

          {error && (
            <div style={{ color: "var(--error)", fontSize: 13 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "var(--accent)",
              color: "#0d1117",
              fontWeight: 600,
              padding: "10px 0",
              borderRadius: "var(--radius)",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
