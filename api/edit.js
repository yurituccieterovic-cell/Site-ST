export default async function handler(req, res) {
  const token = process.env.arvore_github_token;
  if (!token) return res.status(500).json({ error: 'No token' });

  // aqui virá a lógica: editar arquivo, commit, push
  res.json({ message: 'Arquiteto pronto' });
}

export const config = { runtime: 'edge' };
