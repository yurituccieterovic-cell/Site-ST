import { useCallback, useEffect, useRef, useState } from "react";

// Ditado por voz (speech-to-text) usando o reconhecimento nativo do navegador —
// grátis, custo zero, roda no próprio aparelho. Em PT-BR. Funciona em Chrome,
// Edge e Safari; em navegadores sem suporte, `supported` vem false e o botão some.

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SpeechRecognitionErrorLike) => void) | null;
};
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
}
interface SpeechRecognitionErrorLike {
  error?: string;
}

function mensagemDoErro(code: string | undefined): string {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Permissão do microfone negada. Libere o microfone nas configurações do navegador.";
    case "no-speech":
      return "Não ouvi nada. Tente falar mais perto do microfone.";
    case "audio-capture":
      return "Não encontrei um microfone. Verifique se há um conectado.";
    case "network":
      return "Falha de rede no reconhecimento de voz. Tente de novo.";
    case "aborted":
      return "";
    case "language-not-supported":
      return "Este navegador não tem reconhecimento de voz em português.";
    default:
      return "O ditado por voz falhou. Tente de novo.";
  }
}

function getCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useDictation(onChange: (text: string) => void) {
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const seedRef = useRef("");
  const finalRef = useRef("");
  const keepAliveRef = useRef(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supported = getCtor() !== null;

  const buildRec = useCallback((): SpeechRecognitionLike | null => {
    const Ctor = getCtor();
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = "pt-BR";
    rec.continuous = false;
    rec.interimResults = true;
    finalRef.current = "";
    rec.onresult = (e) => {
      let finalText = "";
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        const t = r[0]?.transcript ?? "";
        if (r.isFinal) finalText += t;
        else interim += t;
      }
      finalRef.current = finalText;
      onChangeRef.current((seedRef.current + finalText + interim).replace(/^\s+/, ""));
    };
    rec.onend = () => {
      if (finalRef.current) {
        seedRef.current = (seedRef.current + finalRef.current).replace(/\s*$/, "") + " ";
        finalRef.current = "";
      }
      if (keepAliveRef.current) {
        const next = buildRec();
        if (next) {
          recRef.current = next;
          try { next.start(); return; } catch { /* cai pro encerramento */ }
        }
      }
      setListening(false);
      recRef.current = null;
    };
    rec.onerror = (e) => {
      const code = e?.error;
      if (keepAliveRef.current && (code === "no-speech" || code === "aborted")) return;
      const m = mensagemDoErro(code);
      if (m) setError(m);
      keepAliveRef.current = false;
      setListening(false);
      recRef.current = null;
    };
    return rec;
  }, []);

  const stop = useCallback(() => {
    keepAliveRef.current = false;
    try { recRef.current?.stop(); } catch { /* ignore */ }
  }, []);

  const start = useCallback(
    (currentText: string) => {
      if (!getCtor()) return;
      setError(null);
      try { recRef.current?.stop(); } catch { /* ignore */ }
      seedRef.current = currentText ? currentText.replace(/\s*$/, "") + " " : "";
      keepAliveRef.current = true;
      const rec = buildRec();
      if (!rec) return;
      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        keepAliveRef.current = false;
        setError("Não consegui iniciar o ditado. Tente de novo.");
      }
    },
    [buildRec],
  );

  // startOnce: single utterance, sem keepAlive — para voice-to-send
  const startOnce = useCallback(
    (currentText: string) => {
      if (!getCtor()) return;
      setError(null);
      try { recRef.current?.stop(); } catch { /* ignore */ }
      seedRef.current = currentText ? currentText.replace(/\s*$/, "") + " " : "";
      keepAliveRef.current = false;
      const rec = buildRec();
      if (!rec) return;
      recRef.current = rec;
      try {
        rec.start();
        setListening(true);
      } catch {
        setError("Não consegui iniciar o ditado. Tente de novo.");
      }
    },
    [buildRec],
  );

  const toggle = useCallback(
    (currentText: string) => {
      if (listening) stop();
      else start(currentText);
    },
    [listening, start, stop],
  );

  useEffect(
    () => () => {
      keepAliveRef.current = false;
      try { recRef.current?.stop(); } catch { /* ignore */ }
    },
    [],
  );

  return { supported, listening, error, start, startOnce, stop, toggle };
}
