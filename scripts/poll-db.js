// Roda a cada 5 minutos via GitHub Actions
// Verifica mensagens novas no banco e marca como processadas

const API = 'https://site-st.vercel.app/api/db';
const KEY = process.env.DB_API_KEY;

async function req(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'x-api-key': KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.warn(`Resposta não-JSON em ${method} ${path} (${res.status}): ${text.slice(0, 120)}`);
    return {};
  }
}

async function main() {
  const now = new Date().toISOString();
  console.log(`[${now}] Verificando banco...`);

  // Lê inbox — mensagens enviadas pelos Claudes
  const inbox = await req('GET', '/inbox');
  const novas = (inbox.data || []).filter(m => !m.lida);

  if (novas.length === 0) {
    console.log('Nenhuma mensagem nova.');
  } else {
    console.log(`${novas.length} mensagem(ns) nova(s):`);
    for (const msg of novas) {
      console.log(`  [${msg.origem || '?'}] ${msg.info || msg.texto || JSON.stringify(msg)}`);
      // Marca como lida
      await req('PUT', `/inbox/${msg._id}`, { ...msg, lida: true });
    }
  }

  // Registra atividade no banco
  await req('POST', '/atividade', {
    tipo: 'poll',
    mensagens_novas: novas.length,
    timestamp: now,
    origem: 'github-actions',
  });

  console.log('Pronto.');
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
