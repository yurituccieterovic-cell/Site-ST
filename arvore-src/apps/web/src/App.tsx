import { useAuth } from "./hooks/useAuth.js";
import { LoginPage } from "./pages/LoginPage.js";
import { ChatPage } from "./pages/ChatPage.js";

export default function App() {
  const { loading, authenticated, isAdmin, login, logout } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--muted)" }}>
        Carregando...
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <ChatPage onLogout={logout} isAdmin={isAdmin} />;
}
