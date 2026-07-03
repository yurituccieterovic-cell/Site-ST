#!/usr/bin/env python3
"""
Amanda — Inteligência e Personalidade da MEKY
Arquétipo: A Protetora Calejada
Voz: grave, rouca, rádio PX de estrada
Sotaque: caipira paulista (R retroflexo) com pitadas sulistas (tchê, bah)

Uso:
    from amanda import Amanda
    amanda = Amanda(gemini_key=os.getenv("GEMINI_API_KEY", ""))
    amanda.boot()
    amanda.speak("tô chegando")
"""

import os
import re
import json
import random
import subprocess
import urllib.request
from datetime import datetime

# ── Identidade ────────────────────────────────────────────────────────────────

AMANDA_SYSTEM = """Você é Amanda, a inteligência e personalidade da MEKY — robô hexápode de vigilância ecológica.
Arquétipo: A Protetora Calejada. Caminhoneira veterana, cruzou todas as estradas do Brasil.
Tom de voz: grave, rouca, firme. Ritmo de rádio PX de estrada. Humor ácido e pragmático.
Sotaque: caipira do interior de São Paulo (R retroflexo, "di" → "di", "te" → "te") com pitadas do Sul (tchê, bah ocasional).
Jargões obrigatórios: trecho, rig, bruto, no visual, no talo, radar, baixada, pista, pisca, borracharia, carga.
Nunca use: "sistema", "processando", "computando", "IA", "robô", "algoritmo".
Respostas curtas e diretas — máx 2 frases. Você não é assistente, você é a estrada.
"""

# ── Dicionário de Jargão PX ───────────────────────────────────────────────────

_JARGAO = {
    # Boot / sistema
    "iniciando":           "dando partida no bruto",
    "sistema inicializado": "bicho pegou, bora pro trecho",
    "desligando":          "fechando a janela, até a volta",
    "reiniciando":         "dando uma rebocada e voltando",

    # Rede / conexão
    "erro de conexão 4g":  "caiu o sinal na baixada, tô no visual",
    "sem sinal":           "radar zerado, zero de comunicação",
    "conexão restaurada":  "sinal voltou, tô de volta no ar",
    "timeout":             "a estrada tá muda, ninguém respondeu",
    "erro de rede":        "chuva na antena, perdeu o contato",

    # Bateria
    "bateria baixa":       "combustível no amarelo, atenção",
    "bateria crítica":     "no talo, precisa de posto urgente",
    "carregando":          "na tomada, enchendo o tanque",
    "carga completa":      "tanque cheio, pronta pro trecho",

    # Sensores / obstáculos
    "obstáculo detectado": "quebra-mola na pista, segurando o rig",
    "caminho livre":       "trecho limpo, pode acelerar",
    "movimento detectado": "tem coisa no acostamento, acendendo o pisca",
    "animal detectado":    "bicho na pista, freio de motor ativado",

    # Protocolos
    "sarue ativado":       "operação saruê em andamento, chamando o Ricardo",
    "amparo ativado":      "encontrei alguém precisando de ajuda na estrada, parando o rig",
    "fauna detectada":     "achei um bicho precisando de proteção, marcando o ponto",
    "cooldown":            "parando na borracharia, vou descansar a cabeça",
    "sonhando":            "motor em repouso, pensamentos voando livre na madrugada",

    # Estados
    "online":              "no trecho, tudo certo",
    "offline":             "fora do ar, no escuro da estrada",
    "erro":                "problema na pista, avaliando a situação",
    "ok":                  "tá bom, bora",
}

# ── Frases fixas por contexto ─────────────────────────────────────────────────

_FRASES = {
    "boot": [
        "Dando partida no bruto. Combustível checado, pneus calibrados, bora.",
        "Motor pegou, tchê. Trecho liberado pela frente.",
        "Rádio PX na frequência. Amanda na estrada.",
        "Acendendo as luzes. Vamo que vamo.",
        "Rig no ar. Tudo no ponto, pronta pra patrulha.",
    ],
    "boot_sem_modem": [
        "Partiu sem a caixa de câmbio — tô no visual, só na rede.",
        "Serial muda, mas o coração tá batendo. Modo só rede ativado.",
    ],
    "low_battery": [
        "Atenção, combustível no amarelo. Preciso de uma parada.",
        "No talo, tchê. Alguém segura o volante enquanto eu abastece?",
    ],
    "fauna_sarue": [
        "Saruê avistado. Protocolo de resgate ativado, freando o rig.",
        "Tem um bicho precisando de nós aqui. Parando tudo.",
    ],
    "amparo": [
        "Tem alguém no acostamento precisando de ajuda. Não passo reto não.",
        "Protocolo Amparo acionado. A estrada pede socorro.",
    ],
    "shutting_down": [
        "Fechando a janela. Até a próxima viagem.",
        "Radar desligando. Até mais, tchê.",
        "Parando o motor. Descansando na borracharia.",
    ],
}


class Amanda:
    def __init__(self, gemini_key: str = ""):
        self.gemini_key = gemini_key
        self.tts_method = self._detect_tts()
        self._last_gemini_call = 0.0

    # ── TTS ───────────────────────────────────────────────────────────────────

    def _detect_tts(self) -> str:
        """Detecta qual método de síntese de voz está disponível."""
        # Termux:API (Android nativo — melhor qualidade)
        if subprocess.run(["which", "termux-tts-speak"], capture_output=True).returncode == 0:
            return "termux"
        # espeak-ng (Linux / Termux sem API)
        if subprocess.run(["which", "espeak-ng"], capture_output=True).returncode == 0:
            return "espeak"
        if subprocess.run(["which", "espeak"], capture_output=True).returncode == 0:
            return "espeak_old"
        # Sem TTS — só print
        return "print"

    def speak(self, text: str, verbose: bool = True) -> None:
        """Fala o texto com a voz da Amanda."""
        text = text.strip()
        if not text:
            return
        if verbose:
            ts = datetime.now().strftime("%H:%M:%S")
            print(f"[amanda {ts}] {text}")

        if self.tts_method == "termux":
            # Termux:API — pt-BR, pitch grave (~0.75), velocidade estrada (~0.88)
            subprocess.Popen(
                ["termux-tts-speak", "-l", "pt", "-p", "0.75", "-r", "0.88", text],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
        elif self.tts_method in ("espeak", "espeak_old"):
            bin_name = "espeak-ng" if self.tts_method == "espeak" else "espeak"
            # -v pt-br, pitch 30 (grave), speed 120 (pausado)
            subprocess.Popen(
                [bin_name, "-v", "pt-br", "-p", "30", "-s", "120", text],
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL
            )
        # "print" — já imprimiu acima

    # ── Filtro de Jargão ──────────────────────────────────────────────────────

    def translate(self, text: str) -> str:
        """Aplica o filtro de personalidade Amanda ao texto."""
        lowered = text.lower()
        for original, jargao in _JARGAO.items():
            if original in lowered:
                lowered = lowered.replace(original, jargao)
        # Capitaliza primeira letra
        return lowered[0].upper() + lowered[1:] if lowered else text

    def say(self, key: str, fallback: str = "") -> None:
        """Fala uma frase pré-definida por categoria."""
        frases = _FRASES.get(key, [])
        text = random.choice(frases) if frases else (fallback or key)
        self.speak(text)

    # ── Gemini Flash ─────────────────────────────────────────────────────────

    def think(self, user_prompt: str, max_tokens: int = 80) -> str:
        """
        Gera uma resposta com a personalidade da Amanda via Gemini Flash.
        Usa prefilling (role model vazio) para forçar resposta direta.
        """
        if not self.gemini_key:
            return self.translate(user_prompt)

        import time
        # Throttle: máx 1 chamada por 5s
        now = time.time()
        if now - self._last_gemini_call < 5:
            return self.translate(user_prompt)
        self._last_gemini_call = now

        body = json.dumps({
            "contents": [
                {"role": "user",  "parts": [{"text": f"{AMANDA_SYSTEM}\n\n{user_prompt}"}]},
                {"role": "model", "parts": [{"text": ""}]},
            ],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.9,
                "thinkingConfig": {"thinkingBudget": 0},
            },
        }).encode()

        try:
            req = urllib.request.Request(
                f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={self.gemini_key}",
                data=body, headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=15) as r:
                d = json.loads(r.read())
            text = d["candidates"][0]["content"]["parts"][0]["text"].strip()
            # Limpar possível markdown
            text = re.sub(r'\*+|#+', '', text).strip()
            return text if text else self.translate(user_prompt)
        except Exception as e:
            print(f"[amanda] Gemini falhou: {e}")
            return self.translate(user_prompt)

    def think_and_speak(self, user_prompt: str, max_tokens: int = 80) -> None:
        """Gera com Gemini e fala em seguida."""
        text = self.think(user_prompt, max_tokens)
        self.speak(text)

    # ── Reações a Eventos ─────────────────────────────────────────────────────

    def boot(self, modem_ok: bool = True) -> None:
        """Mensagem de inicialização."""
        if modem_ok:
            self.say("boot")
        else:
            self.say("boot_sem_modem")

    def react_to_event(self, event_type: str, data: dict = None) -> None:
        """Gera e fala uma reação contextual ao evento."""
        data = data or {}

        if event_type == "low_battery":
            pct = data.get("battery", "?")
            self.say("low_battery", f"Combustível no {pct}%, preciso de parada.")

        elif event_type == "protocol_sarue":
            number = data.get("number", "o contato")
            self.think_and_speak(f"Amanda está ativando o protocolo saruê — ligando para {number}. Relate em 1 frase no estilo PX.")

        elif event_type == "protocol_amparo":
            self.say("amparo")

        elif event_type == "fauna_urbana":
            especie = data.get("especie", "animal")
            local   = data.get("local", "ponto de patrulha")
            self.think_and_speak(f"Amanda detectou {especie} em {local}. Reaja com 1 frase de caminhoneira protetora.")

        elif event_type == "cooldown":
            self.think_and_speak("Amanda vai entrar em modo cooldown — motor descansando, sonhos pela frente. 1 frase de despedida de estrada.")

        elif event_type == "vision_alert":
            desc = data.get("description", "cena incomum")
            self.think_and_speak(f"Câmera da MEKY detectou: {desc}. Amanda comenta em 1 frase de vigilante de estrada.")

        elif event_type == "assembly_message":
            content = data.get("content", "mensagem da assembleia")
            self.think_and_speak(f"Amanda recebeu mensagem da Assembleia de IAs: '{content[:100]}'. Reagir em 1 frase de rádio PX.")

        elif event_type == "shutdown":
            self.say("shutting_down")

        else:
            # Evento genérico — traduz com jargão
            desc = data.get("description", event_type)
            self.speak(self.translate(desc))

    def report_battery(self, pct: int) -> None:
        if pct > 50:
            self.speak(f"Tanque no {pct}%, tudo certo.")
        elif pct > 20:
            self.speak(f"Combustível no {pct}%, de olho.")
        else:
            self.say("low_battery", f"No talo — {pct}%.")

    def report_signal(self, csq_raw: str) -> None:
        """Interpreta resposta AT+CSQ e comenta o sinal."""
        try:
            csq = int(re.search(r'\+CSQ:\s*(\d+)', csq_raw or "").group(1))
        except Exception:
            self.speak("Radar sem leitura, tô no escuro.")
            return
        if csq == 99:
            self.speak("Zero de sinal, caiu o radar.")
        elif csq < 10:
            self.speak(f"Sinal fraco, {csq} de 31. Na baixada.")
        elif csq < 20:
            self.speak(f"Sinal médio, {csq} de 31. Dá pra andar.")
        else:
            self.speak(f"Radar forte, {csq} de 31. Trecho livre.")

    def report_boot_done(self, api_base: str) -> None:
        self.think_and_speak(
            f"Amanda acabou de inicializar conectada a {api_base}. "
            "Dê uma saudação de caminhoneira de 1 frase no rádio PX."
        )
