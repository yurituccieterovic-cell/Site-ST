import { useState, useRef, useCallback } from "react";

export function useSpeech({ onWord } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // ── STT ──────────────────────────────────────────────────────────────────
  function startListening(onResult, onEnd) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Seu browser não suporta reconhecimento de voz. Use Chrome ou Edge."); return; }
    const r = new SR();
    r.lang = "pt-BR";
    r.interimResults = true;
    r.continuous = false;
    recognitionRef.current = r;

    r.onresult = e => {
      const transcript = Array.from(e.results).map(x => x[0].transcript).join("");
      onResult?.(transcript);
    };
    r.onend = () => { setIsListening(false); onEnd?.(); };
    r.onerror = () => { setIsListening(false); onEnd?.(); };

    r.start();
    setIsListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  // ── TTS ──────────────────────────────────────────────────────────────────
  const speak = useCallback((text, { onStart, onEnd } = {}) => {
    const synth = synthRef.current;
    synth.cancel();
    const chunks = splitChunks(text, 180);
    let idx = 0;

    function next() {
      if (idx >= chunks.length) {
        setIsSpeaking(false);
        onEnd?.();
        return;
      }
      const utt = new SpeechSynthesisUtterance(chunks[idx++]);
      utt.lang = "pt-BR";
      utt.pitch = 1.2;
      utt.rate = 1.0;
      utt.volume = 1;

      const voices = synth.getVoices();
      const v = voices.find(x => x.lang === "pt-BR" && x.name.includes("Google"))
               || voices.find(x => x.lang.startsWith("pt"));
      if (v) utt.voice = v;

      utt.onboundary = e => {
        if (e.name === "word") onWord?.(Math.random() > .5 ? "open" : "semi");
      };
      utt.onend = () => { onWord?.("semi"); next(); };
      utt.onerror = () => next();
      synth.speak(utt);
    }

    if (idx === 0) { onStart?.(); setIsSpeaking(true); }
    next();
  }, [onWord]);

  function cancelSpeech() {
    synthRef.current.cancel();
    setIsSpeaking(false);
  }

  return { isListening, isSpeaking, startListening, stopListening, speak, cancelSpeech };
}

function splitChunks(text, maxLen) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > maxLen) { if (cur) chunks.push(cur.trim()); cur = s; }
    else cur += (cur ? " " : "") + s;
  }
  if (cur) chunks.push(cur.trim());
  return chunks.length ? chunks : [text.slice(0, maxLen)];
}
