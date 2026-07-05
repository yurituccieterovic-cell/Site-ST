#!/usr/bin/env bash
# termux-bootstrap.sh — Bootstrap completo de um Termux dedicado para o PAP
#
# Uso (num Termux limpo):
#   curl -sSL https://raw.githubusercontent.com/yurituccieterovic-cell/Site-ST/main/scripts/termux-bootstrap.sh | bash
#   OU: bash termux-bootstrap.sh
#
# O que instala:
#   - Node.js 24, pnpm, Python 3, Git, OpenSSH, wget, jq
#   - Claude Code CLI
#   - Scripts pap-* em ~/bin/
#   - Clone do repositório Site-ST
#   - Configuração de .bashrc com aliases e variáveis

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[TERMUX]${NC} $*"; }
warn()  { echo -e "${YELLOW}[TERMUX]${NC} $*"; }
error() { echo -e "${RED}[TERMUX]${NC} $*" >&2; exit 1; }

# Verificar que está no Termux
[[ -d "/data/data/com.termux" ]] || error "Este script deve rodar no Termux"

info "Iniciando bootstrap do PAP no Termux..."

# ── 1. Atualizar pacotes ──────────────────────────────────────────────────────
info "Atualizando pacotes..."
pkg update -y -qq
pkg upgrade -y -qq

# ── 2. Instalar dependências base ─────────────────────────────────────────────
info "Instalando dependências base..."
pkg install -y -qq \
  nodejs-lts python git openssh wget curl jq \
  termux-api make clang binutils

# Node.js 24 via nvm (pkg nodejs pode ser mais antigo)
if node --version | grep -qE "^v(18|19|20|21|22|23)"; then
  info "Instalando Node.js 24 via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  source "$NVM_DIR/nvm.sh"
  nvm install 24
  nvm use 24
  nvm alias default 24
fi

# ── 3. Instalar pnpm ──────────────────────────────────────────────────────────
info "Instalando pnpm..."
npm install -g pnpm@latest --silent

# ── 4. Instalar Claude Code ───────────────────────────────────────────────────
info "Instalando Claude Code..."
npm install -g @anthropic-ai/claude-code --silent || warn "Claude Code: instalar manualmente se falhar"

# ── 5. Criar diretório de scripts ─────────────────────────────────────────────
mkdir -p "$HOME/bin"
mkdir -p "$HOME/.pap"

# ── 6. Clonar repositório ─────────────────────────────────────────────────────
REPO_DIR="$HOME/Site-ST"
if [[ -d "$REPO_DIR" ]]; then
  info "Repositório já existe em $REPO_DIR — atualizando..."
  git -C "$REPO_DIR" pull origin main
else
  info "Clonando repositório..."
  # Verificar se tem chave SSH configurada
  if [[ -f "$HOME/.ssh/id_ed25519" ]]; then
    git clone git@github.com:yurituccieterovic-cell/Site-ST.git "$REPO_DIR"
  else
    git clone https://github.com/yurituccieterovic-cell/Site-ST.git "$REPO_DIR"
    warn "Usando HTTPS — configure SSH para push sem senha"
  fi
fi

# ── 7. Criar scripts pap-* ───────────────────────────────────────────────────

# pap-sync
cat > "$HOME/bin/pap-sync" << 'SYNCEOF'
#!/usr/bin/env bash
set -euo pipefail
REPO="$HOME/Site-ST"
cd "$REPO"
echo "[pap-sync] Sincronizando assembleias..."
python3 scripts/sync-assembleias.py 2>/dev/null || echo "[pap-sync] sync-assembleias.py não disponível"
echo "[pap-sync] Done"
SYNCEOF

# pap-email-fim
cat > "$HOME/bin/pap-email-fim" << 'EMAILEOF'
#!/usr/bin/env bash
set -euo pipefail
ATA_FILE="/tmp/pap-ata.md"
[[ -f "$ATA_FILE" ]] || { echo "ATA não encontrada em $ATA_FILE"; exit 1; }

# Ler credenciais
source "$HOME/.pap-secrets" 2>/dev/null || source "/root/.pap-secrets" 2>/dev/null || true

GMAIL="${GMAIL_ACCOUNT:-}"
PASS="${GMAIL_APP_PASSWORD:-}"

[[ -z "$GMAIL" || -z "$PASS" ]] && { echo "Gmail não configurado em .pap-secrets"; exit 1; }

SUBJECT="PAP ATA — $(date '+%Y-%m-%d %H:%M')"
BODY="$(cat "$ATA_FILE")"

python3 << PYEOF
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

msg = MIMEMultipart("alternative")
msg["Subject"] = "$SUBJECT"
msg["From"] = "$GMAIL"
msg["To"] = "$GMAIL"
msg.attach(MIMEText("""$BODY""", "plain", "utf-8"))

ctx = ssl.create_default_context()
with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=ctx) as s:
    s.login("$GMAIL", "$PASS")
    s.sendmail("$GMAIL", "$GMAIL", msg.as_string())
print("✓ ATA enviada para $GMAIL")
PYEOF
EMAILEOF

# pap-secrets (lê e valida)
cat > "$HOME/bin/pap-secrets-check" << 'SECRETEOF'
#!/usr/bin/env bash
SECRETS="${HOME}/.pap-secrets"
[[ -f "$SECRETS" ]] || { echo "Arquivo não encontrado: $SECRETS"; exit 1; }
echo "Campos configurados:"
while IFS='=' read -r key val; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  if [[ -z "$val" ]]; then
    echo "  ❌ $key = (vazio)"
  else
    echo "  ✅ $key = (preenchido)"
  fi
done < "$SECRETS"
SECRETEOF

# pap-deploy
cat > "$HOME/bin/pap-deploy" << 'DEPLOYEOF'
#!/usr/bin/env bash
set -euo pipefail
REPO="$HOME/Site-ST"
cd "$REPO"
echo "[pap-deploy] Fazendo push para GitHub → Railway auto-deploy..."
git push origin main
echo "[pap-deploy] Push concluído. Railway vai buildar automaticamente."
DEPLOYEOF

# pap-logs (monitora Railway via API)
cat > "$HOME/bin/pap-logs" << 'LOGSEOF'
#!/usr/bin/env bash
source "$HOME/.pap-secrets" 2>/dev/null || source "/root/.pap-secrets"
TOKEN="${RAILWAY_TOKEN:-}"
[[ -z "$TOKEN" ]] && { echo "RAILWAY_TOKEN não configurado"; exit 1; }
echo "Abrindo Railway dashboard para logs..."
termux-open-url "https://railway.app/dashboard" 2>/dev/null || echo "Acesse: https://railway.app/dashboard"
LOGSEOF

# pap-oracle (atalho para SSH no Oracle)
cat > "$HOME/bin/pap-oracle" << 'ORACLEEOF'
#!/usr/bin/env bash
ORACLE_IP="${ORACLE_IP:-}"
if [[ -z "$ORACLE_IP" ]]; then
  echo "Configure ORACLE_IP em ~/.pap-secrets ou execute:"
  echo "  ORACLE_IP=<IP> pap-oracle"
  exit 1
fi
ssh -i "$HOME/.ssh/oracle_key" ubuntu@"$ORACLE_IP" "$@"
ORACLEEOF

chmod +x "$HOME/bin"/pap-*

# ── 8. Configurar .bashrc ─────────────────────────────────────────────────────
info "Configurando .bashrc..."

PAP_BASHRC="$HOME/.bashrc.pap"
cat > "$PAP_BASHRC" << 'BASHRCEOF'
# PAP — Aliases e configuração do ecossistema

export PATH="$HOME/bin:$PATH"
export REPO_ROOT="$HOME/Site-ST"
export EDITOR="nano"

# Aliases rápidos
alias cdpap='cd $HOME/Site-ST/aliancapanorama-src'
alias cdscripts='cd $HOME/Site-ST/scripts'
alias paplog='tail -f /tmp/pap-*.log 2>/dev/null'
alias papstatus='pap-secrets-check && echo "" && git -C $HOME/Site-ST log --oneline -5'

# Carrega NVM se instalado
export NVM_DIR="$HOME/.nvm"
[[ -s "$NVM_DIR/nvm.sh" ]] && source "$NVM_DIR/nvm.sh"
[[ -s "$NVM_DIR/bash_completion" ]] && source "$NVM_DIR/bash_completion"
BASHRCEOF

# Adicionar ao .bashrc se não já incluído
if ! grep -q "bashrc.pap" "$HOME/.bashrc" 2>/dev/null; then
  echo "" >> "$HOME/.bashrc"
  echo "# PAP ecossistema" >> "$HOME/.bashrc"
  echo "[[ -f ~/.bashrc.pap ]] && source ~/.bashrc.pap" >> "$HOME/.bashrc"
fi

# ── 9. Criar .pap-secrets template ───────────────────────────────────────────
SECRETS_FILE="$HOME/.pap-secrets"
if [[ ! -f "$SECRETS_FILE" ]]; then
  cat > "$SECRETS_FILE" << 'SECRETSTEMPLATE'
# PAP Secrets — NÃO commitar, NÃO compartilhar
# chmod 600 ~/.pap-secrets

GMAIL_ACCOUNT=luddlocke@gmail.com
GMAIL_APP_PASSWORD=

OPENAI_API_KEY=
GEMINI_API_KEY=
AI_API_KEY=

DATABASE_URL=
SESSION_SECRET=

RAILWAY_TOKEN=
BLUESKY_HANDLE=isa-pap.bsky.social
BLUESKY_APP_PASSWORD=

MEKY_TOKEN=
ARVORE_TOKEN=
MC_TOKEN=

# IP do servidor Oracle Always Free
ORACLE_IP=
SECRETSTEMPLATE
  chmod 600 "$SECRETS_FILE"
  warn ".pap-secrets criado — preencha com seus dados"
fi

# ── 10. Configurar Git ────────────────────────────────────────────────────────
info "Configurando Git..."
git config --global user.name "Yuri Tuccieterovic" 2>/dev/null || true
git config --global user.email "yurituccieterovic@gmail.com" 2>/dev/null || true
git config --global push.autoSetupRemote true 2>/dev/null || true

# ── 11. Configurar SSH key se não existir ────────────────────────────────────
if [[ ! -f "$HOME/.ssh/id_ed25519" ]]; then
  info "Gerando chave SSH..."
  mkdir -p "$HOME/.ssh"
  ssh-keygen -t ed25519 -C "termux-pap" -f "$HOME/.ssh/id_ed25519" -N ""
  info "Chave pública (adicione no GitHub Settings → SSH Keys):"
  cat "$HOME/.ssh/id_ed25519.pub"
fi

# ── Resumo ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Termux PAP bootstrap concluído!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Scripts disponíveis em ~/bin:"
echo "  pap-sync              — sincronizar assembleias"
echo "  pap-email-fim         — enviar ATA por email"
echo "  pap-deploy            — git push → Railway"
echo "  pap-logs              — abrir Railway dashboard"
echo "  pap-oracle            — SSH no Oracle VM"
echo "  pap-secrets-check     — verificar secrets"
echo ""
echo "Próximos passos:"
echo "  1. Preencha secrets: nano ~/.pap-secrets"
echo "  2. Adicione chave SSH no GitHub"
echo "  3. Recarregue o shell: source ~/.bashrc"
echo "  4. Teste: cdpap && git log --oneline -3"
echo ""
