export default async function handler(req, res) {
  const token = process.env.arvore_github_token;
  if (!token) return res.status(500).json({ error: 'No token' });

  // aqui virá a lógica: editar arquivo, commit, push
  res.json({ message: 'Arquiteto pronto' });
}

export const config = { runtime: 'edge' };
import { Octokit } from '@octokit/rest'; // precisa instalar no Vercel

export default async function handler(req, res) {
  const token = process.env.arvore_github_token;
  if (!token) {
    return res.status(500).json({ error: 'GitHub token not configured.' });
  }

  // A Arvore enviaria estas informações no corpo da requisição POST
  const { filePath, newContent, commitMessage } = req.body;

  if (!filePath || !newContent || !commitMessage) {
    return res.status(400).json({ error: 'Missing filePath, newContent, or commitMessage.' });
  }

  const octokit = new Octokit({ auth: token });
  const owner = 'yurituccieterovic-cell';
  const repo = 'Site-ST';
  const branch = 'main'; // ou uma branch temporária, como discutimos

  try {
    // 1. Obter o SHA do arquivo existente (necessário para atualizar)
    const { data: { sha } } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branch,
    });
