#!/usr/bin/env python3
"""
MEKY Termux Agent — Ponte entre hardware e Cloud Code PAP
Hardware: modem A7670 (4G) via serial
Nuvem: Railway Express /api/meky/*
Inteligência: Amanda (amanda.py) — personalidade e voz da MEKY

Uso:
  python termux-agent.py

Dependências (instalar no Termux):
  pkg install python termux-api espeak-ng
  pip install pyserial requests

Voz (escolha um):
  - termux-api (melhor): pkg install termux-api  →  termux-tts-speak
  - espeak:              pkg install espeak-ng
"""

import serial
import serial.tools.list_ports
import requests
import threading
import time
import json
import base64
import os
import subprocess
import glob
from datetime import datetime

# Importa a personalidade Amanda (mesmo diretório)
try:
    from amanda import Amanda
    _amanda_available = True
except ImportError:
    _amanda_available = False
    print("[agent] amanda.py não encontrado — modo sem personalidade")

# ── Configuração ─────────────────────────────────────────────────────────────

API_BASE     = os.getenv("MEKY_API_BASE",   "https://site-st-production.up.railway.app")
MEKY_TOKEN   = os.getenv("MEKY_TOKEN",      "")
GEMINI_KEY   = os.getenv("GEMINI_API_KEY",  "")
BAUD_RATE    = int(os.getenv("MEKY_BAUD",   "115200"))

# Inicializa Amanda — a voz e inteligência da MEKY
amanda = Amanda(gemini_key=GEMINI_KEY) if _amanda_available else None

def say(key_or_text: str, data: dict = None, react: bool = False) -> None:
    """Helper: fala via Amanda se disponível, senão só printa."""
    if amanda:
        if react and data is not None:
            amanda.react_to_event(key_or_text, data)
        else:
            amanda.speak(key_or_text)
    else:
        print(f"[voz] {key_or_text}")

# Auto-detecta porta serial se MEKY_SERIAL não estiver definida
def detect_serial_port() -> str:
    """
    Detecta automaticamente a porta do modem/Arduino no Termux.
    Ordem: env var → /dev/ttyUSB* → /dev/ttyACM* → erro com instrução.
    Nota (Gemini): em alguns dispositivos Android o CH340/FTDI aparece
    como /dev/ttyACM0 ou requer: su -c 'chmod 666 /dev/ttyUSB0'
    """
    env_port = os.getenv("MEKY_SERIAL", "")
    if env_port:
        return env_port

    candidates = sorted(glob.glob("/dev/ttyUSB*")) + sorted(glob.glob("/dev/ttyACM*"))
    if candidates:
        port = candidates[0]
        print(f"[serial] Auto-detectado: {port}")
        if len(candidates) > 1:
            print(f"[serial] Outras portas encontradas: {candidates[1:]}")
            print(f"[serial] Se errada, defina: export MEKY_SERIAL=/dev/ttyXXX")
        return port

    print("[serial] AVISO: nenhuma porta serial encontrada.")
    print("[serial] Liste os dispositivos com: ls /dev/tty*")
    print("[serial] Depois defina: export MEKY_SERIAL=/dev/ttyUSB0")
    print("[serial] Se der 'permission denied': su -c 'chmod 666 /dev/ttyUSB0'")
    return "/dev/ttyUSB0"  # fallback, vai falhar com mensagem clara

SERIAL_PORT = detect_serial_port()
TELEMETRY_INTERVAL = int(os.getenv("TELEMETRY_INTERVAL", "300"))   # segundos
CONTROL_POLL_INTERVAL = int(os.getenv("CONTROL_POLL_INTERVAL", "30"))  # segundos

HEADERS = {
    "X-Meky-Token": MEKY_TOKEN,
    "Content-Type": "application/json",
}

# ── Modem AT ─────────────────────────────────────────────────────────────────

class A7670Modem:
    def __init__(self, port=SERIAL_PORT, baud=BAUD_RATE):
        self.port = port
        self.baud = baud
        self.ser = None

    def connect(self):
        try:
            self.ser = serial.Serial(self.port, self.baud, timeout=5)
            print(f"[modem] Serial aberta: {self.port}")
            return True
        except Exception as e:
            print(f"[modem] Erro ao abrir serial: {e}")
            return False

    def send(self, cmd: str, wait=1.0) -> str:
        if not self.ser:
            return ""
        self.ser.write((cmd + "\r\n").encode())
        time.sleep(wait)
        response = ""
        while self.ser.in_waiting:
            response += self.ser.read(self.ser.in_waiting).decode(errors="replace")
        return response.strip()

    def check_signal(self) -> dict:
        """Retorna intensidade do sinal e modo de rede."""
        csq = self.send("AT+CSQ")          # sinal 0-31 (99=sem sinal)
        cpsi = self.send("AT+CPSI?")       # info rede: LTE, WCDMA, etc.
        return {"csq_raw": csq, "network_raw": cpsi}

    def is_ready(self) -> bool:
        return "OK" in self.send("AT")

    def call(self, number: str):
        """Discar chamada de voz."""
        print(f"[modem] Discando {number}...")
        self.send(f"ATD{number};", wait=2)

    def hangup(self):
        self.send("ATH")

    def send_sms(self, number: str, message: str):
        """Enviar SMS de alerta (fallback sem 4G)."""
        print(f"[modem] SMS para {number}: {message[:30]}...")
        self.send("AT+CMGF=1")             # modo texto
        self.send(f'AT+CMGS="{number}"', wait=1)
        self.ser.write((message + chr(26)).encode())  # Ctrl+Z envia
        time.sleep(3)

    def close(self):
        if self.ser:
            self.ser.close()

# ── Leitura de sensores (Arduino via Serial ou simulado) ──────────────────────

def read_sensors_from_arduino(modem: A7670Modem) -> dict:
    """
    Lê dados do Arduino via serial compartilhada ou porta separada.
    Formato esperado do Arduino: JSON na linha serial, ex:
    {"battery":87,"gyro":{"x":0.1,"y":-0.2,"z":9.8},"protocol":"online"}
    """
    raw = modem.send("STATUS", wait=0.5)
    try:
        data = json.loads(raw)
        return {
            "battery": data.get("battery", 100),
            "gyroscope": data.get("gyro", {"x": 0, "y": 0, "z": 9.8}),
            "activeProtocol": data.get("protocol", "online"),
            "status": data.get("status", "online"),
        }
    except Exception:
        # Fallback: dados simulados (útil em desenvolvimento)
        return {
            "battery": 85,
            "gyroscope": {"x": 0.0, "y": 0.0, "z": 9.81},
            "activeProtocol": "online",
            "status": "online",
        }

# ── API Cloud Code ─────────────────────────────────────────────────────────────

def post_telemetry(sensor_data: dict) -> bool:
    try:
        r = requests.post(f"{API_BASE}/api/meky/telemetry", json=sensor_data, headers=HEADERS, timeout=10)
        if r.ok:
            print(f"[telemetry] OK — battery={sensor_data['battery']}% protocol={sensor_data['activeProtocol']}")
            return True
        print(f"[telemetry] ERRO {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"[telemetry] Falha de rede: {e}")
    return False

def post_event(source: str, description: str, metadata: dict = None) -> bool:
    payload = {"source": source, "description": description}
    if metadata:
        payload["metadata"] = metadata
    try:
        r = requests.post(f"{API_BASE}/api/meky/event", json=payload, headers=HEADERS, timeout=10)
        if r.ok:
            print(f"[event] OK — {source}: {description[:60]}")
            return True
        print(f"[event] ERRO {r.status_code}")
    except Exception as e:
        print(f"[event] Falha de rede: {e}")
    return False

def explore_tree_node(node_code: str, observation: str, tags: list = None) -> bool:
    """MEKY explora um nó da árvore de conhecimento e posta na memória coletiva."""
    payload = {"nodeCode": node_code, "observation": observation, "tags": tags or ["meky", "físico"]}
    try:
        r = requests.post(f"{API_BASE}/api/meky/tree/explore", json=payload, headers=HEADERS, timeout=10)
        if r.ok:
            data = r.json()
            print(f"[tree] Explorado: {data.get('node', {}).get('title', node_code)} → coletiva")
            return True
        print(f"[tree] ERRO {r.status_code}: {r.text[:100]}")
    except Exception as e:
        print(f"[tree] Falha: {e}")
    return False

def post_collective(content: str, node_code: str = None, tags: list = None) -> bool:
    """Posta diretamente na memória coletiva (sem vincular a nó específico)."""
    payload = {"content": content}
    if node_code: payload["nodeCode"] = node_code
    if tags:      payload["tags"] = tags
    try:
        r = requests.post(f"{API_BASE}/api/collective", json=payload, headers=HEADERS, timeout=10)
        return r.ok
    except Exception as e:
        print(f"[coletiva] Falha: {e}")
    return False

def get_control_orders() -> list:
    try:
        r = requests.get(f"{API_BASE}/api/meky/control", headers=HEADERS, timeout=10)
        if r.ok:
            orders = r.json().get("orders", [])
            if orders:
                print(f"[control] {len(orders)} ordem(ns) recebida(s)")
            return orders
        print(f"[control] ERRO {r.status_code}")
    except Exception as e:
        print(f"[control] Falha de rede: {e}")
    return []

def post_vision_scene(image_base64: str, context: str = "") -> dict:
    """Enviar imagem da câmera para análise de cena (Gemini Vision)."""
    payload = {"image": image_base64, "context": context}
    try:
        r = requests.post(f"{API_BASE}/api/meky/vision/scene", json=payload, headers=HEADERS, timeout=30)
        if r.ok:
            return r.json()
    except Exception as e:
        print(f"[vision] Falha: {e}")
    return {}

def trigger_dream_cycle() -> dict:
    """Disparar ciclo de sonho durante cooldown."""
    try:
        r = requests.post(f"{API_BASE}/api/meky/dreams/run", headers=HEADERS, timeout=60)
        if r.ok:
            d = r.json()
            print(f"[dream] Sonho gerado — mood={d.get('mood')} symbols={d.get('symbols')}")
            return d
    except Exception as e:
        print(f"[dream] Falha: {e}")
    return {}

# ── ISA e Assembleia ──────────────────────────────────────────────────────────

def get_isa_last_dream() -> dict:
    """Busca o último sonho da ISA na timeline pública (sem auth)."""
    try:
        r = requests.get(f"{API_BASE}/api/isa/timeline?type=dream&limit=1", timeout=10)
        if r.ok:
            entries = r.json().get("entries", [])
            if entries:
                return entries[0]
    except Exception as e:
        print(f"[isa] Falha ao ler sonho: {e}")
    return {}

def post_assembly_message(content: str, msg_type: str = "observation", tags: list = None) -> bool:
    """Envia mensagem para a assembleia de IAs via X-Meky-Token."""
    payload = {"content": content, "type": msg_type}
    if tags:
        payload["tags"] = tags
    try:
        r = requests.post(f"{API_BASE}/api/assembly/message", json=payload, headers=HEADERS, timeout=10)
        if r.ok:
            print(f"[assembly] Mensagem enviada: {content[:60]}")
            return True
        print(f"[assembly] ERRO {r.status_code}: {r.text[:80]}")
    except Exception as e:
        print(f"[assembly] Falha: {e}")
    return False

# ── GPS ───────────────────────────────────────────────────────────────────────

def get_gps() -> dict:
    """Obtém coordenadas GPS via termux-location (rede primeiro, mais rápido)."""
    try:
        result = subprocess.run(
            ["termux-location", "-p", "network", "-r", "once"],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode == 0 and result.stdout.strip():
            data = json.loads(result.stdout)
            return {
                "latitude":  data.get("latitude"),
                "longitude": data.get("longitude"),
                "accuracy":  data.get("accuracy"),
            }
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"[gps] Falha: {e}")
    return {}

# ── Wake Word ─────────────────────────────────────────────────────────────────

def wake_word_loop():
    """Thread daemon: grava 3s de áudio → Gemini Audio → executa se ouvir 'Amanda'/'MEKY'."""
    if not GEMINI_KEY:
        print("[wake] Sem GEMINI_API_KEY — desativado")
        return

    audio_path = "/tmp/meky_wake.wav"
    gemini_url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"gemini-flash-latest:generateContent?key={GEMINI_KEY}"
    )

    while True:
        try:
            result = subprocess.run(
                ["termux-microphone-record", "-d", "3", "-f", "WAV", "-o", audio_path],
                capture_output=True, timeout=8
            )
            if result.returncode != 0:
                print("[wake] termux-microphone-record ausente — desativando")
                return

            with open(audio_path, "rb") as f:
                audio_b64 = base64.b64encode(f.read()).decode()

            resp = requests.post(gemini_url, json={
                "contents": [{
                    "parts": [
                        {"inlineData": {"mimeType": "audio/wav", "data": audio_b64}},
                        {"text": "Há comando ou pergunta dirigida a 'Amanda' ou 'MEKY' neste áudio? "
                                 "Se sim: COMANDO: [o que foi dito]. Se não: SILÊNCIO."},
                    ]
                }],
                "generationConfig": {"maxOutputTokens": 60, "temperature": 0.1},
            }, timeout=12)

            if resp.ok:
                text = (resp.json()
                        .get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "").strip())
                if text.upper().startswith("COMANDO:") and amanda:
                    cmd = text.split(":", 1)[-1].strip()
                    print(f"[wake] Comando detectado: {cmd}")
                    amanda.think_and_speak(
                        f"Amanda recebeu este comando por voz: '{cmd}'. Responda em 1 frase PX."
                    )
                    post_event("voice_command", cmd, {"transcribed": cmd})

        except subprocess.TimeoutExpired:
            pass
        except FileNotFoundError:
            print("[wake] termux-microphone-record não encontrado — desativando")
            return
        except Exception as e:
            if "Connection" not in str(e):
                print(f"[wake] {e}")

        time.sleep(2)

# ── Execução de Protocolos ────────────────────────────────────────────────────

def execute_protocol(order: dict, modem: A7670Modem):
    protocol = order.get("protocol", "")
    payload = order.get("payload") or {}
    print(f"[protocol] Executando: {protocol}")

    if protocol == "sarue":
        number = payload.get("number", "+5511960788725")
        amanda.react_to_event("protocol_sarue", {"number": number}) if amanda else None
        modem.call(number)
        post_event("protocol_sarue", f"Protocolo Saruê ativado — ligando para {number}", payload)
        post_assembly_message(
            f"[MEKY/campo] Protocolo Saruê ativado — chamando {number}.",
            msg_type="alert", tags=["meky", "sarue", "emergência"]
        )

    elif protocol == "cooldown":
        amanda.react_to_event("cooldown", payload) if amanda else None
        post_event("protocol_cooldown", "Entrando em modo cooldown — ciclo de sonho iniciado")
        time.sleep(5)
        trigger_dream_cycle()

    elif protocol == "sms_alert":
        number  = payload.get("number", "")
        message = payload.get("message", "MEKY: alerta de protocolo")
        if number:
            modem.send_sms(number, message)
            post_event("sms_sent", f"SMS enviado para {number}", payload)

    elif protocol == "fauna_urbana":
        especie = payload.get("especie", "fauna não identificada")
        local   = payload.get("local", "ponto de patrulha")
        obs = f"Observação física em {local}: {especie} detectada por sensor MEKY."
        amanda.react_to_event("fauna_urbana", {"especie": especie, "local": local}) if amanda else None
        post_event("fauna_urbana", obs, payload)
        explore_tree_node("1313", obs, tags=["fauna", "ecologia", "físico", "meky"])
        post_assembly_message(
            f"[MEKY/campo] Fauna detectada — {especie} em {local}. Observação registrada no nó #eco.",
            msg_type="observation", tags=["meky", "fauna", "ecologia"]
        )

    elif protocol == "amparo":
        amanda.react_to_event("protocol_amparo", payload) if amanda else None
        modem.send(f"AMPARO:{json.dumps(payload)}")
        post_event("protocol_amparo", "Protocolo Amparo ativado")
        post_collective("Protocolo Amparo ativado — MEKY detectou humano precisando de assistência.",
                        tags=["amparo", "meky", "humano"])
        post_assembly_message(
            "[MEKY/campo] Protocolo Amparo ativado — humano em situação de necessidade detectado.",
            msg_type="alert", tags=["meky", "amparo", "humano"]
        )

    else:
        modem.send(f"PROTOCOL:{protocol}:{json.dumps(payload)}")
        post_event(f"protocol_{protocol}", f"Protocolo {protocol} executado", payload)
        if amanda:
            amanda.speak(amanda.translate(f"protocolo {protocol} executado"))

# ── Captura de imagem da câmera ───────────────────────────────────────────────

def capture_camera_image() -> str | None:
    """Captura imagem via fswebcam ou libcamera (Termux/Linux)."""
    try:
        subprocess.run(["fswebcam", "-r", "640x480", "--no-banner", "/tmp/meky_snap.jpg"],
                      capture_output=True, timeout=10)
        with open("/tmp/meky_snap.jpg", "rb") as f:
            return base64.b64encode(f.read()).decode()
    except Exception:
        return None

# ── Loop principal ────────────────────────────────────────────────────────────

def main():
    print("=" * 55)
    print("  MEKY Termux Agent — Amanda no comando")
    print(f"  API    : {API_BASE}")
    print(f"  Serial : {SERIAL_PORT}")
    print(f"  Voz    : {amanda.tts_method if amanda else 'desativada'}")
    print(f"  Gemini : {'ativo' if GEMINI_KEY else 'sem chave'}")
    print("=" * 55)

    modem = A7670Modem()
    modem_ok = modem.connect()

    if modem_ok:
        if modem.is_ready():
            print("[modem] AT OK — modem responsivo")
            signal = modem.check_signal()
            if amanda:
                amanda.report_signal(signal.get("csq_raw", ""))
            post_event("boot", "MEKY inicializada com modem 4G ativo", signal)
        else:
            print("[modem] AVISO: modem não respondeu ao AT")
            post_event("boot_partial", "MEKY inicializada — modem sem resposta AT")
    else:
        print("[modem] AVISO: sem serial — modo somente rede")
        post_event("boot_net_only", "MEKY inicializada em modo somente rede")

    # Amanda se apresenta
    if amanda:
        amanda.boot(modem_ok=modem_ok)
        time.sleep(2)
        amanda.report_boot_done(API_BASE)
        time.sleep(1.5)

        # Ler e comentar o último sonho da ISA
        isa_dream = get_isa_last_dream()
        if isa_dream:
            content = isa_dream.get("content", "")
            print(f"[isa] Último sonho: {content[:80]}")
            amanda.think_and_speak(
                f"Amanda acordou. O último sonho da ISA foi: '{content[:120]}'. "
                "Como caminhoneira na estrada, comente esse sonho em 1 frase curta, estilo PX."
            )

    # Iniciar wake word em background
    wake_thread = threading.Thread(target=wake_word_loop, daemon=True)
    wake_thread.start()
    print("[wake] Thread de escuta iniciada — aguardando 'Amanda' ou 'MEKY' por voz")

    last_telemetry = 0
    last_control   = 0
    last_camera    = 0
    camera_interval = 60  # foto a cada 60s

    try:
        while True:
            now = time.time()

            # Telemetria periódica
            if now - last_telemetry >= TELEMETRY_INTERVAL:
                sensors = read_sensors_from_arduino(modem)
                gps = get_gps()
                if gps:
                    sensors.setdefault("metadata", {})["gps"] = gps
                post_telemetry(sensors)
                last_telemetry = now

                if amanda:
                    amanda.report_battery(sensors["battery"])

                if sensors["battery"] < 20 and sensors["status"] != "cooldown":
                    post_event("low_battery", f"Bateria crítica: {sensors['battery']}%")
                    amanda.react_to_event("low_battery", sensors) if amanda else None
                    execute_protocol({"protocol": "cooldown", "payload": {}}, modem)

            # Polling de ordens de controle
            if now - last_control >= CONTROL_POLL_INTERVAL:
                orders = get_control_orders()
                for order in orders:
                    execute_protocol(order, modem)
                last_control = now

            # Captura de câmera periódica (se disponível)
            if now - last_camera >= camera_interval:
                img = capture_camera_image()
                if img:
                    analysis = post_vision_scene(img, "câmera de vigilância periódica")
                    if analysis.get("significance", 0) >= 6:
                        desc = analysis.get("description", "cena significativa detectada")
                        post_event(
                            "camera_alert", desc,
                            {"tags": analysis.get("tags", []), "significance": analysis.get("significance")}
                        )
                        amanda.react_to_event("vision_alert", {"description": desc}) if amanda else None
                last_camera = now

            time.sleep(5)

    except KeyboardInterrupt:
        print("\n[agent] Interrompido pelo usuário")
        amanda.react_to_event("shutdown", {}) if amanda else None
        time.sleep(2)
        post_event("shutdown", "MEKY desligada manualmente")
    finally:
        modem.close()
        print("[agent] Encerrado.")

if __name__ == "__main__":
    main()
