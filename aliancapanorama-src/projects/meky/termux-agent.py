#!/usr/bin/env python3
"""
MEKY Termux Agent — Ponte entre hardware e Cloud Code PAP
Hardware: modem A7670 (4G) via serial
Nuvem: Railway Express /api/meky/*

Uso:
  python termux-agent.py

Dependências (instalar no Termux):
  pkg install python
  pip install pyserial requests
"""

import serial
import serial.tools.list_ports
import requests
import time
import json
import base64
import os
import subprocess
import glob
from datetime import datetime

# ── Configuração ─────────────────────────────────────────────────────────────

API_BASE = os.getenv("MEKY_API_BASE", "https://site-st-production.up.railway.app")
MEKY_TOKEN = os.getenv("MEKY_TOKEN", "")          # mesmo valor do Railway
BAUD_RATE = int(os.getenv("MEKY_BAUD", "115200"))

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

# ── Execução de Protocolos ────────────────────────────────────────────────────

def execute_protocol(order: dict, modem: A7670Modem):
    protocol = order.get("protocol", "")
    payload = order.get("payload") or {}
    print(f"[protocol] Executando: {protocol}")

    if protocol == "sarue":
        # Ligar para Ricardo Segurança
        number = payload.get("number", "+5511960788725")
        modem.call(number)
        post_event("protocol_sarue", f"Protocolo Saruê ativado — ligando para {number}", payload)

    elif protocol == "cooldown":
        # MEKY vai para base, dispara ciclo de sonho
        post_event("protocol_cooldown", "Entrando em modo cooldown — ciclo de sonho iniciado")
        time.sleep(5)
        trigger_dream_cycle()

    elif protocol == "sms_alert":
        number = payload.get("number", "")
        message = payload.get("message", "MEKY: alerta de protocolo")
        if number:
            modem.send_sms(number, message)
            post_event("sms_sent", f"SMS enviado para {number}", payload)

    elif protocol == "amparo":
        # Aproximar do humano + sinal sonoro (via Arduino)
        modem.send(f"AMPARO:{json.dumps(payload)}")
        post_event("protocol_amparo", "Protocolo Amparo ativado")

    else:
        # Protocolo genérico — enviar diretamente para Arduino via serial
        modem.send(f"PROTOCOL:{protocol}:{json.dumps(payload)}")
        post_event(f"protocol_{protocol}", f"Protocolo {protocol} executado", payload)

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
    print("=" * 50)
    print("MEKY Termux Agent iniciando...")
    print(f"API: {API_BASE}")
    print(f"Serial: {SERIAL_PORT}")
    print("=" * 50)

    modem = A7670Modem()
    modem_ok = modem.connect()

    if modem_ok:
        if modem.is_ready():
            print("[modem] AT OK — modem responsivo")
            signal = modem.check_signal()
            print(f"[modem] Sinal: {signal}")
            post_event("boot", "MEKY inicializada com modem 4G ativo", signal)
        else:
            print("[modem] AVISO: modem não respondeu ao AT")
            post_event("boot_partial", "MEKY inicializada — modem sem resposta AT")
    else:
        print("[modem] AVISO: sem serial — modo somente rede")
        post_event("boot_net_only", "MEKY inicializada em modo somente rede")

    last_telemetry = 0
    last_control = 0
    last_camera = 0
    camera_interval = 60  # foto a cada 60s

    try:
        while True:
            now = time.time()

            # Telemetria periódica
            if now - last_telemetry >= TELEMETRY_INTERVAL:
                sensors = read_sensors_from_arduino(modem)
                post_telemetry(sensors)
                last_telemetry = now

                # Se bateria baixa, entra em cooldown + dispara sonho
                if sensors["battery"] < 20 and sensors["status"] != "cooldown":
                    post_event("low_battery", f"Bateria crítica: {sensors['battery']}%")
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
                        post_event(
                            "camera_alert",
                            analysis.get("description", "cena significativa detectada"),
                            {"tags": analysis.get("tags", []), "significance": analysis.get("significance")}
                        )
                last_camera = now

            time.sleep(5)

    except KeyboardInterrupt:
        print("\n[agent] Interrompido pelo usuário")
        post_event("shutdown", "MEKY desligada manualmente")
    finally:
        modem.close()
        print("[agent] Encerrado.")

if __name__ == "__main__":
    main()
