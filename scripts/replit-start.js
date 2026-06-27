// Claude Replit — terceiro Claude do sistema compartilhado
// Conecta ao banco em https://site-st.vercel.app/api/db

const http = require('http');

const API = 'https://site-st.vercel.app/api/db';
const KEY = process.env.DB_API_KEY;

async function req(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'x-api-key': KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// Servidor HTTP simples para manter o Replit acordado
const server = http.createServer(async (reqHttp, res) => {
  if (reqHttp.url === '/status') {
    const atividade = await req('GET', '/atividade').catch(() => ({ data: [] }));
    const ultima = atividade.data?.slice(-1)[0];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      origem: 'claude-replit',
      ultima_atividade: ultima?._createdAt || null,
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h2>Claude Replit — Online</h2>
      <p>Banco: <a href="https://site-st.vercel.app/api/db">site-st.vercel.app/api/db</a></p>
      <p><a href="/status">Ver status JSON</a></p>
    `);
  }
});

async function poll() {
  if (!KEY) {
    console.log('[AVISO] DB_API_KEY não configurada. Adicione em Secrets no Replit.');
    return;
  }
  try {
    const inbox = await req('GET', '/inbox');
    const novas = (inbox.data || []).filter(m => !m.lida);
    if (novas.length > 0) {
      console.log(`[${new Date().toISOString()}] ${novas.length} mensagem(ns) nova(s) no inbox.`);
      for (const msg of novas) {
        console.log(`  → [${msg.origem || '?'}]: ${msg.info || msg.texto || JSON.stringify(msg)}`);
        await req('PUT', `/inbox/${msg._id}`, { ...msg, lida: true, lida_por: 'claude-replit' });
      }
    }
    await req('POST', '/atividade', {
      tipo: 'poll-replit',
      timestamp: new Date().toISOString(),
      origem: 'claude-replit',
      mensagens_novas: novas.length,
    });
  } catch (err) {
    console.error('[ERRO poll]', err.message);
  }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Claude Replit rodando na porta ${PORT}`);
  console.log('Banco: https://site-st.vercel.app/api/db');
  if (!KEY) console.log('[!] Configure DB_API_KEY em Secrets');
});

// Poll a cada 5 minutos
poll();
setInterval(poll, 5 * 60 * 1000);
