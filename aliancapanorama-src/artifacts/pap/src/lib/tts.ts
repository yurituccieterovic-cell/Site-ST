import { useCallback, useEffect, useRef, useState } from "react";

// TTS para o SABIÁ: tenta o backend (OpenAI, qualidade alta) e cai para a
// voz nativa do navegador (grátis, custo zero) se o backend falhar.
// `endpoint` = URL completa do endpoint TTS (ex: "/api/age/lisange/sabia/tts").

function getPtVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return [];
  const br = voices.filter((v) => /pt[-_]br/i.test(v.lang));
  const pt = voices.filter((v) => /^pt/i.test(v.lang) && !br.includes(v));
  return [...br, ...pt];
}

function splitSegments(text: string): string[] {
  const matches = text.replace(/\s+/g, " ").trim().match(/[^.!?…]+[.!?…]*\s*/g);
  const raw = matches && matches.length ? matches : [text];
  const out: string[] = [];
  for (const p of raw) {
    const t = p.trim();
    if (!t) continue;
    const last = out[out.length - 1];
    if (last && last.length < 40) out[out.length - 1] = `${last} ${t}`;
    else out.push(t);
  }
  return out.length ? out : [text];
}

export function useTts(endpoint: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const seqRef = useRef(0);
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const teardownAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      if (a.src) { try { URL.revokeObjectURL(a.src); } catch {} }
      a.src = "";
      audioRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    seqRef.current += 1;
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    teardownAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    setPlayingKey(null);
    setLoadingKey(null);
  }, [teardownAudio]);

  const speakNative = useCallback((key: string, text: string, mySeq: number): boolean => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
    try {
      window.speechSynthesis.cancel();
      const segments = splitSegments(text);
      if (!segments.length) return false;
      const voices = getPtVoices();
      const pitches = [1.0, 1.18, 0.86];
      setLoadingKey((k) => (k === key ? null : k));
      setPlayingKey(key);
      segments.forEach((seg, idx) => {
        const utter = new SpeechSynthesisUtterance(seg);
        utter.lang = "pt-BR";
        if (voices.length) utter.voice = voices[idx % voices.length];
        utter.pitch = pitches[idx % pitches.length];
        const isLast = idx === segments.length - 1;
        if (isLast) {
          utter.onend = () => { if (mySeq === seqRef.current) setPlayingKey((k) => (k === key ? null : k)); };
        }
        utter.onerror = () => {
          if (mySeq === seqRef.current) {
            setPlayingKey((k) => (k === key ? null : k));
            setLoadingKey((k) => (k === key ? null : k));
          }
        };
        window.speechSynthesis.speak(utter);
      });
      return true;
    } catch { return false; }
  }, []);

  const speak = useCallback(
    async (key: string, text: string) => {
      const clean = (text || "").trim();
      if (!clean) return;
      stop();
      const mySeq = ++seqRef.current;
      const controller = new AbortController();
      abortRef.current = controller;
      setLoadingKey(key);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ text: clean }),
          signal: controller.signal,
        });
        if (mySeq !== seqRef.current) return;
        if (!res.ok) {
          if (!speakNative(key, clean, mySeq)) {
            setLoadingKey((k) => (k === key ? null : k));
            setPlayingKey((k) => (k === key ? null : k));
          }
          return;
        }
        const blob = await res.blob();
        if (mySeq !== seqRef.current) return;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        const cleanup = () => {
          try { URL.revokeObjectURL(url); } catch {}
          if (audioRef.current === audio) audioRef.current = null;
        };
        audio.onended = () => { cleanup(); setPlayingKey((k) => (k === key ? null : k)); };
        audio.onerror = () => { cleanup(); setPlayingKey((k) => (k === key ? null : k)); setLoadingKey((k) => (k === key ? null : k)); };
        setLoadingKey((k) => (k === key ? null : k));
        setPlayingKey(key);
        try { await audio.play(); } catch { cleanup(); setPlayingKey((k) => (k === key ? null : k)); }
      } catch {
        if (mySeq === seqRef.current) {
          if (!speakNative(key, clean, mySeq)) { setLoadingKey(null); setPlayingKey(null); }
        }
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [endpoint, stop, speakNative],
  );

  const toggle = useCallback(
    (key: string, text: string) => {
      if (playingKey === key || loadingKey === key) { stop(); return; }
      void speak(key, text);
    },
    [playingKey, loadingKey, speak, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { playingKey, loadingKey, speak, toggle, stop };
}
