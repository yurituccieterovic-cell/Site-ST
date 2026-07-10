import { useState, useEffect, useRef, useCallback } from "react";
import Avatar from "./components/Avatar.jsx";
import InputBar from "./components/InputBar.jsx";
import HistorySidebar from "./components/HistorySidebar.jsx";
import { useGemini } from "./hooks/useGemini.js";
import { useSpeech } from "./hooks/useSpeech.js";
import { useMemory } from "./hooks/useMemory.js";
import { useCrewAI } from "./hooks/useCrewAI.js";

const SAUDACOES = {
  manha: "Bom dia! Sou a Babel, governadora do ecossistema Tucci. Como posso ajudar hoje?",
  tarde:  "Boa tarde! Babel aqui — pronta para pensar junto com você.",
  noite:  "Boa noite! Sou a Babel. Pode falar, digitar ou enviar um arquivo — estou aqui.",
};

function getSaudacao() {
  const h = new Date().getHours();
  return h < 12 ? SAUDACOES.manha : h < 18 ? SAUDACOES.tarde : SAUDACOES.noite;
}

let msgIdCounter = 0;
function newId() { return ++msgIdCounter; }

export default function App() {
  const [messages, setMessages] = useState([]);
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [mouthState, setMouthState] = useState("semi");
  const [status, setStatus] = useState("pronta");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [histItems, setHistItems] = useState([]);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [memCtx, setMemCtx] = useState("");

  const chatRef = useRef(null);
  const bubbleTimerRef = useRef(null);

  const { sendMessage: geminiSend, isLoading } = useGemini();
  const { loadMemory, saveMemory } = useMemory();
  const { processTriggers, stripTriggers } = useCrewAI();

  const onWord = useCallback(state => setMouthState(state), []);

  const { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech } = useSpeech({ onWord });

  // ── PWA install ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  }

  // ── Boot: carregar memória + saudação ────────────────────────────────────
  useEffect(() => {
    (async () => {
      const ctx = await loadMemory();
      setMemCtx(ctx);
      const intro = getSaudacao();
      addMessage("babel", intro);
      showBubble(intro);
      speak(intro, {
        onStart: () => { setMouthState("semi"); setStatus("falando…"); },
        onEnd:   () => { setMouthState("smile"); setTimeout(() => setMouthState("semi"), 600); setStatus("pronta"); },
      });
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  function addMessage(role, content, extra = {}) {
    const id = newId();
    setMessages(prev => [...prev, { id, role, content, ...extra }]);
    return id;
  }

  function showBubble(text) {
    setBubbleText(text.slice(0, 200) + (text.length > 200 ? "…" : ""));
    setBubbleVisible(true);
    clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setBubbleVisible(false), 8000);
  }

  function updateMessage(id, patch) {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m));
  }

  // ── Enviar mensagem ──────────────────────────────────────────────────────
  async function handleSend(userText, file) {
    if (!userText && !file) return;
    if (isSpeaking) cancelSpeech();

    addMessage("user", userText || (file?.name ?? "Arquivo enviado"));
    setHistItems(prev => [{ id: newId(), label: (userText || "📎").slice(0, 40) }, ...prev.slice(0, 19)]);

    const loadId = addMessage("babel", null, { loading: true });
    setStatus("pensando…");
    showBubble("…");

    try {
      const rawReply = await geminiSend(userText, file, memCtx);
      const triggered = await processTriggers(rawReply);
      const reply = stripTriggers(rawReply);

      updateMessage(loadId, { content: reply, loading: false, triggers: triggered });
      showBubble(reply);
      await saveMemory(userText, reply);

      speak(reply, {
        onStart: () => setStatus("falando…"),
        onEnd:   () => {
          setMouthState("smile");
          setTimeout(() => setMouthState("semi"), 600);
          setStatus("pronta");
        },
      });

      if (triggered.length) setStatus(`acionou ${triggered.map(t => t.agent).join(", ")}`);
    } catch (e) {
      updateMessage(loadId, { content: `Erro: ${e.message}`, loading: false });
      setStatus("erro");
    }
  }

  // ── Microfone ────────────────────────────────────────────────────────────
  const micTextRef = useRef("");

  function handleMicToggle() {
    if (isListening) {
      stopListening();
      if (micTextRef.current) handleSend(micTextRef.current, null);
      micTextRef.current = "";
    } else {
      setStatus("ouvindo…");
      startListening(
        transcript => { micTextRef.current = transcript; },
        () => {
          setStatus("pronta");
          if (micTextRef.current) { handleSend(micTextRef.current, null); micTextRef.current = ""; }
        }
      );
    }
  }

  // ── PDF download ─────────────────────────────────────────────────────────
  async function downloadPdf(content) {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, 20, 20);
    doc.save(`babel-${Date.now()}.pdf`);
  }

  function downloadMd(content) {
    const blob = new Blob([`# Babel\n\n${content}`], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `babel-${Date.now()}.md`;
    a.click();
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="app">
      <HistorySidebar isOpen={sidebarOpen} items={histItems} onClose={() => setSidebarOpen(false)}/>

      <div className="main">
        {/* Header */}
        <header className="header">
          <button className="icon-btn" onClick={() => setSidebarOpen(v => !v)} title="Histórico">☰</button>
          <span className="logo">BABEL</span>
          <span className="status">{status}</span>
          {installPrompt && (
            <button className="install-btn" onClick={handleInstall}>Instalar</button>
          )}
        </header>

        {/* Avatar + Bubble */}
        <section className="avatar-section">
          <Avatar mouthState={mouthState} isSpeaking={isSpeaking} isListening={isListening}/>
          <div className={`bubble ${bubbleVisible ? "visible" : ""}`}>
            <p>{bubbleText}</p>
          </div>
        </section>

        {/* Chat */}
        <div className="chat" ref={chatRef}>
          {messages.map(msg => (
            <div key={msg.id} className={`msg ${msg.role}`}>
              {msg.loading
                ? <span className="dots"><span/><span/><span/></span>
                : <>
                  <span dangerouslySetInnerHTML={{ __html: formatText(msg.content ?? "") }}/>
                  {msg.role === "babel" && !msg.loading && (
                    <div className="msg-actions">
                      <button className="dl-btn" onClick={() => downloadMd(msg.content)}>⬇ .md</button>
                      <button className="dl-btn" onClick={() => downloadPdf(msg.content)}>⬇ .pdf</button>
                      {msg.triggers?.map(t => (
                        <span key={t.agent} className="trigger-badge">⚡ {t.agent}</span>
                      ))}
                    </div>
                  )}
                </>
              }
            </div>
          ))}
        </div>

        {/* Input */}
        <InputBar
          onSend={handleSend}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onMicToggle={handleMicToggle}
        />
      </div>
    </div>
  );
}

function formatText(txt) {
  return txt
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}
