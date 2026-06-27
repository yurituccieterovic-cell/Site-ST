// api/db.js — banco de dados via GitHub API, protegido por API key
const OWNER = 'yurituccieterovic-cell';
const REPO = 'Site-ST';
const BRANCH = 'main';
const DB_PATH = 'data/db.json';

async function readDB(token) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DB_PATH}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const file = await res.json();
  const content = atob(file.content.replace(/\n/g, ''));
  return { data: JSON.parse(content), sha: file.sha };
}

async function writeDB(token, data, sha) {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DB_PATH}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'db update',
        content: btoa(JSON.stringify(data, null, 2)),
        sha,
        branch: BRANCH,
      }),
    }
  );
  return res.ok;
}

export default async function handler(req) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey || apiKey !== (process.env.DB_API_KEY || '')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const githubToken = process.env.arvore_github_token;
  if (!githubToken) {
    return new Response(JSON.stringify({ error: 'GitHub token não configurado' }), { status: 500 });
  }

  const url = new URL(req.url);
  const parts = url.pathname.replace('/api/db', '').split('/').filter(Boolean);
  const collection = parts[0];
  const itemId = parts[1];
  const method = req.method;

  try {
    // GET / — lista collections
    if (!collection && method === 'GET') {
      const { data } = await readDB(githubToken);
      return new Response(JSON.stringify({ collections: Object.keys(data.collections) }), { status: 200 });
    }

    const { data: db, sha } = await readDB(githubToken);
    if (!db.collections) db.collections = {};

    // GET /:collection
    if (method === 'GET' && collection && !itemId) {
      const col = db.collections[collection] || [];
      return new Response(JSON.stringify({ collection, count: col.length, data: col }), { status: 200 });
    }

    // POST /:collection — inserir
    if (method === 'POST' && collection) {
      if (!db.collections[collection]) db.collections[collection] = [];
      const body = await req.json();
      const items = Array.isArray(body) ? body : [body];
      const ts = Date.now();
      items.forEach((item, i) => {
        item._id = `${ts}${i}`;
        item._createdAt = new Date().toISOString();
        db.collections[collection].push(item);
      });
      await writeDB(githubToken, db, sha);
      return new Response(JSON.stringify({ inserted: items.length, data: items }), { status: 201 });
    }

    // PUT /:collection/:id — atualizar
    if (method === 'PUT' && collection && itemId) {
      const col = db.collections[collection] || [];
      const idx = col.findIndex(i => i._id === itemId);
      if (idx === -1) return new Response(JSON.stringify({ error: 'Item não encontrado' }), { status: 404 });
      const body = await req.json();
      db.collections[collection][idx] = { ...col[idx], ...body, _id: itemId };
      await writeDB(githubToken, db, sha);
      return new Response(JSON.stringify(db.collections[collection][idx]), { status: 200 });
    }

    // DELETE /:collection/:id — deletar item
    if (method === 'DELETE' && collection && itemId) {
      const col = db.collections[collection] || [];
      const idx = col.findIndex(i => i._id === itemId);
      if (idx === -1) return new Response(JSON.stringify({ error: 'Item não encontrado' }), { status: 404 });
      col.splice(idx, 1);
      await writeDB(githubToken, db, sha);
      return new Response(JSON.stringify({ deleted: true }), { status: 200 });
    }

    // DELETE /:collection — deletar collection
    if (method === 'DELETE' && collection && !itemId) {
      delete db.collections[collection];
      await writeDB(githubToken, db, sha);
      return new Response(JSON.stringify({ deleted: collection }), { status: 200 });
    }

    return new Response(JSON.stringify({ error: 'Rota não encontrada' }), { status: 404 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export const config = { runtime: 'edge' };
