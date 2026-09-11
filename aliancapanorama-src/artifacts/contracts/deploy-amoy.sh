#!/usr/bin/env bash
# Deploy ArvoreToken.sol → Polygon Amoy Testnet
# Pré-requisitos:
#   1. Foundry instalado (forge/cast): curl -L https://foundry.paradigm.xyz | bash && foundryup
#   2. Carteira com POL de testnet (faucet: https://faucet.polygon.technology/ ou https://faucet.quicknode.com/polygon/amoy)
#      Carteira de deploy: 0xf983ff3C805C78dEcB47Fb10DAa906D25D57Cb61
#      Chave privada: ver ARVR_DEPLOY_PRIVKEY em /root/.pap-secrets
#
# Uso: bash deploy-amoy.sh

set -euo pipefail

export PATH="$PATH:/root/.foundry/bin"

PRIVKEY=$(grep ARVR_DEPLOY_PRIVKEY /root/.pap-secrets | cut -d= -f2)
RPC="https://polygon-amoy.drpc.org"
CHAIN_ID=80002

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "==> Verificando saldo..."
ADDRESS=$(cast wallet address "$PRIVKEY")
BALANCE=$(cast balance "$ADDRESS" --rpc-url "$RPC")
echo "    Endereço: $ADDRESS"
echo "    Saldo: $BALANCE wei"

if [ "$BALANCE" = "0" ]; then
  echo ""
  echo "❌ SALDO ZERO — Fund the wallet first:"
  echo "   1. Go to https://faucet.quicknode.com/polygon/amoy"
  echo "   2. Paste: $ADDRESS"
  echo "   3. Claim ~0.5 POL (testnet)"
  echo "   4. Wait 1-2 min and re-run this script"
  exit 1
fi

echo "==> Building contract..."
cd /tmp/arvore-deploy 2>/dev/null || {
  mkdir /tmp/arvore-deploy && cd /tmp/arvore-deploy
  forge init --no-git --no-commit . >/dev/null 2>&1
  cp "$SCRIPT_DIR/ArvoreToken.sol" src/ArvoreToken.sol
  rm -f src/Counter.sol test/Counter.t.sol script/Counter.s.sol
}

# Copiar versão atual do contrato
cp "$SCRIPT_DIR/ArvoreToken.sol" src/ArvoreToken.sol
forge build --quiet

echo "==> Deploying to Polygon Amoy (chainId=$CHAIN_ID)..."
DEPLOY_OUT=$(forge create src/ArvoreToken.sol:ArvoreToken \
  --private-key "$PRIVKEY" \
  --rpc-url "$RPC" \
  --broadcast \
  2>&1)

echo "$DEPLOY_OUT"

# Extrair endereço do contrato
CONTRACT_ADDR=$(echo "$DEPLOY_OUT" | grep "Deployed to:" | awk '{print $3}')

if [ -n "$CONTRACT_ADDR" ]; then
  echo ""
  echo "✅ ArvoreToken deployed!"
  echo "   Contract: $CONTRACT_ADDR"
  echo "   Network: Polygon Amoy (chainId=80002)"
  echo "   Explorer: https://amoy.polygonscan.com/address/$CONTRACT_ADDR"
  echo ""

  # Salvar endereço do contrato
  if grep -q "ARVR_CONTRACT_ADDRESS" /root/.pap-secrets; then
    sed -i "s|ARVR_CONTRACT_ADDRESS=.*|ARVR_CONTRACT_ADDRESS=$CONTRACT_ADDR|" /root/.pap-secrets
  else
    echo "ARVR_CONTRACT_ADDRESS=$CONTRACT_ADDR" >> /root/.pap-secrets
  fi
  echo "   Salvo em /root/.pap-secrets como ARVR_CONTRACT_ADDRESS"
else
  echo "❌ Deploy falhou — ver output acima"
  exit 1
fi
