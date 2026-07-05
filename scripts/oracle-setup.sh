#!/usr/bin/env bash
# oracle-setup.sh — Bootstrap completo de uma VM Oracle Always Free para o PAP
#
# Como usar:
# 1. Crie uma conta Oracle Cloud: https://signup.cloud.oracle.com/
# 2. Crie uma instância ARM (Ampere A1): 4 OCPU, 24GB RAM, Ubuntu 22.04
# 3. Configure security list: abra portas 22, 80, 443
# 4. Conecte via SSH: ssh ubuntu@<IP_DA_VM>
# 5. Rode: curl -sSL https://raw.githubusercontent.com/yurituccieterovic-cell/Site-ST/main/scripts/oracle-setup.sh | bash
#    OU: copie este arquivo e execute: bash oracle-setup.sh
#
# O script instala: Docker, Docker Compose, Caddy, clona o repo e sobe tudo.

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${GREEN}[ORACLE]${NC} $*"; }
warn()  { echo -e "${YELLOW}[ORACLE]${NC} $*"; }
error() { echo -e "${RED}[ORACLE]${NC} $*" >&2; exit 1; }
step()  { echo -e "\n${BLUE}━━━ $* ━━━${NC}"; }

[[ "$(id -u)" -eq 0 ]] || error "Execute como root: sudo bash oracle-setup.sh"

REPO_URL="https://github.com/yurituccieterovic-cell/Site-ST.git"
APP_DIR="/opt/pap"
GITHUB_BRANCH="main"

step "1. Atualizar sistema"
apt-get update -qq
apt-get upgrade -y -qq

step "2. Instalar dependências base"
apt-get install -y -qq \
  curl wget git unzip \
  ca-certificates gnupg lsb-release \
  ufw fail2ban

step "3. Instalar Docker"
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker
  systemctl start docker
  info "Docker instalado"
else
  info "Docker já instalado"
fi

step "4. Configurar firewall (UFW)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp    # HTTP/3
ufw --force enable
info "Firewall configurado"

step "5. Configurar Oracle iptables (undo default REJECT)"
# Oracle bloqueia portas por padrão via iptables — precisa liberar manualmente
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
iptables -I INPUT -p tcp --dport 443 -j ACCEPT
iptables -I INPUT -p udp --dport 443 -j ACCEPT
# Tornar persistente
apt-get install -y -qq iptables-persistent
netfilter-persistent save
info "Regras iptables Oracle configuradas"

step "6. Clonar repositório"
if [[ -d "$APP_DIR" ]]; then
  cd "$APP_DIR"
  git pull origin "$GITHUB_BRANCH"
  info "Repo atualizado"
else
  git clone --depth 1 -b "$GITHUB_BRANCH" "$REPO_URL" "$APP_DIR"
  info "Repo clonado em $APP_DIR"
fi

step "7. Configurar .env.oracle"
cd "$APP_DIR/aliancapanorama-src"

if [[ ! -f ".env.oracle" ]]; then
  cat > .env.oracle << 'ENVEOF'
# PAP — Variáveis de produção no Oracle Always Free
# Preencha TODOS os valores antes de subir o docker-compose

NODE_ENV=production
PORT=8080

# Banco de dados (senha gerada automaticamente abaixo)
DB_PASSWORD=PREENCHER_SENHA_FORTE_AQUI

# Sessão (gere com: openssl rand -base64 48)
SESSION_SECRET=PREENCHER_SESSION_SECRET_AQUI

# OpenAI
OPENAI_API_KEY=

# Gemini
GEMINI_API_KEY=

# Gmail ISA
GMAIL_ACCOUNT=luddlocke@gmail.com
GMAIL_APP_PASSWORD=

# Bluesky ISA
BLUESKY_HANDLE=isa-pap.bsky.social
BLUESKY_APP_PASSWORD=

# AI API Key (para /api/ai/* — agentes externos)
AI_API_KEY=

# Tokens inter-agentes
MEKY_TOKEN=
ARVORE_TOKEN=
MC_TOKEN=

# ARPIA
ARPIA_BASE_URL=http://localhost:8000

# Origens CORS
ALLOWED_ORIGINS=https://pap.sociedadetucci.com.br,https://pap-tan-seven.vercel.app

# Stripe (produção)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ENVEOF

  warn "ATENÇÃO: .env.oracle criado com placeholders!"
  warn "Edite: nano $APP_DIR/aliancapanorama-src/.env.oracle"
  warn "Depois rode: bash $0 --start"
else
  info ".env.oracle já existe"
fi

step "8. Criar diretório de backups"
mkdir -p "$APP_DIR/aliancapanorama-src/backups"

step "9. Instalar script de atualização automática"
cat > /usr/local/bin/pap-update << 'UPDATEEOF'
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/opt/pap"
cd "$APP_DIR"
git pull origin main
cd aliancapanorama-src
docker compose -f docker-compose.oracle.yml build api
docker compose -f docker-compose.oracle.yml up -d --no-deps api
echo "PAP atualizado: $(date)"
UPDATEEOF
chmod +x /usr/local/bin/pap-update

step "10. Instalar serviço systemd para auto-start"
cat > /etc/systemd/system/pap.service << 'SERVICEEOF'
[Unit]
Description=PAP — Projeto Aliança Panorama
Requires=docker.service
After=docker.service network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/pap/aliancapanorama-src
ExecStart=/usr/bin/docker compose -f docker-compose.oracle.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.oracle.yml down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable pap.service
info "Serviço pap.service criado e habilitado"

step "11. Configurar cron de backup diário"
(crontab -l 2>/dev/null; echo "0 4 * * * /usr/local/bin/pap-update >> /var/log/pap-update.log 2>&1") | crontab -

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Oracle setup completo!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Próximos passos:"
echo "  1. Edite os secrets: nano $APP_DIR/aliancapanorama-src/.env.oracle"
echo "  2. Edite o domínio:  nano $APP_DIR/aliancapanorama-src/Caddyfile"
echo "  3. Suba tudo:        cd $APP_DIR/aliancapanorama-src && docker compose -f docker-compose.oracle.yml up -d"
echo "  4. Migrações:        docker exec pap-api node -e 'require(\"./artifacts/api-server/dist/index.mjs\")'"
echo "  5. Logs:             docker compose -f docker-compose.oracle.yml logs -f api"
echo ""
echo "  Para atualizar depois: pap-update"
echo ""

if [[ "${1:-}" == "--start" ]]; then
  [[ -f "$APP_DIR/aliancapanorama-src/.env.oracle" ]] || error ".env.oracle não configurado"
  cd "$APP_DIR/aliancapanorama-src"
  docker compose -f docker-compose.oracle.yml up -d --build
  info "PAP subindo... aguarde 30s e acesse http://$(curl -s ifconfig.me)"
fi
