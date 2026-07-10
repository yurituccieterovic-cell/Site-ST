import { useRef, useState } from "react";

export default function InputBar({ onSend, isListening, isSpeaking, onMicToggle }) {
  const [text, setText] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const fileRef = useRef();

  function handleSend() {
    if (isSpeaking) return;
    const t = text.trim();
    if (!t && !uploadFile) return;
    onSend(t, uploadFile);
    setText("");
    setUploadFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleUpload() {
    const url = prompt("Cole um link (YouTube, site) ou cancele para escolher arquivo:");
    if (url === null) {
      fileRef.current?.click();
    } else if (url.trim()) {
      setUploadFile({ type: "url", url: url.trim() });
    }
  }

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (f) setUploadFile(f);
  }

  function clearUpload() {
    setUploadFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="inputbar-wrap">
      {uploadFile && (
        <div className="upload-preview">
          <span>📎</span>
          <span className="up-name">
            {uploadFile.type === "url" ? uploadFile.url.slice(0, 50) + "…" : uploadFile.name}
          </span>
          <button className="up-clear" onClick={clearUpload}>✕</button>
        </div>
      )}
      <div className="inputbar">
        <button
          className={`icon-btn mic-btn ${isListening ? "active" : ""}`}
          onClick={onMicToggle}
          title={isListening ? "Parar gravação" : "Gravar voz"}
        >
          {isListening ? "⏹" : "🎙"}
        </button>

        <textarea
          className="input-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          placeholder={isListening ? "Ouvindo…" : "Pergunte qualquer coisa…"}
          rows={1}
          disabled={isListening}
        />

        <button className="icon-btn" onClick={handleUpload} title="Anexar PDF / Imagem / Link">📎</button>
        <input ref={fileRef} type="file" accept="image/*,.pdf,video/*" style={{ display: "none" }} onChange={handleFile}/>

        <button
          className="icon-btn send-btn"
          onClick={handleSend}
          disabled={isSpeaking || isListening}
          title="Enviar"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
