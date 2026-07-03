#!/usr/bin/env python3
"""
Amanda Dream Cron — ciclo noturno autônomo da Amanda.
Rodar via termux-job-scheduler às 3h ou manualmente.

Uso:
    python amanda-dream-cron.py

Agendar no Termux (uma vez):
    termux-job-scheduler --job-id 42 --script /path/to/amanda-dream-cron.py \
      --period-ms 86400000 --network-type any

Ou via crontab (se cronie instalado):
    0 3 * * * cd /path/to/meky && python amanda-dream-cron.py
"""

import os
import sys
import time

# Adiciona o diretório do script ao path para importar amanda
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from amanda import Amanda

API_BASE   = os.getenv("MEKY_API_BASE",  "https://site-st-production.up.railway.app")
GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")
MEKY_TOKEN = os.getenv("MEKY_TOKEN",     "")

if __name__ == "__main__":
    print(f"[dream-cron] Iniciando ciclo noturno da Amanda — {time.strftime('%H:%M:%S')}")
    amanda = Amanda(gemini_key=GEMINI_KEY)
    sonho = amanda.dream_cycle(api_base=API_BASE, meky_token=MEKY_TOKEN)
    print(f"[dream-cron] Sonho gerado: {sonho[:80]}")
    print("[dream-cron] Concluído.")
