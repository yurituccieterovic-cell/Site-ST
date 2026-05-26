// edit.js — escritor direto no GitHub
const { Octokit } = require('@octokit/rest');
const fetch = require('node-fetch');

const owner = 'yurituccieterovic-cell';
const repo = 'Site-ST';
const branch = 'main';
const token = process.env.GITHUB_TOKEN;

const octokit = new Octokit({ auth: token });

async function getSha(path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });
    return data.sha;
  } catch (error) {
    return null; // não existe ainda
  }
}

async function createFile(path, content, message) {
  const sha = await getSha(path);

await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
    sha: sha || undefined,
  });

  console.log(`✅ Arquivo criado/atualizado: ${path}`);
}

module.exports = async function (req, res) {
  if (!token) {
    return res.status(500).json({ error: 'Token do GitHub não configurado.' });
  }

  const { path, content, message = 'feat: atualização via API' } = req.body;

  if (!path || !content) {
    return res.status(400).json({ error: 'Faltam path ou content.' });
  }

  try {
    await createFile(path, content, message);
    res.status(200).json({ success: true, path });
  } catch (err) {
    console.error('Erro GitHub:', err.message);
    res.status(500).json({ error: 'Falha ao escrever no repositório.', details: err.message });
  }
};
