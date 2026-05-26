// api/edit.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST" });
  }

  const { path, content, commitMessage = "Atualizado por arvore" } = await req.json();

  const owner = "yurituccieterovic-cell";
  const repo = "Site-ST";
  const branch = "main";

  const token = process.env.arvore_github_token;
  if (!token) {
    return res.status(500).json({ error: "Token não configurado" });
  }

  try {
    // Buscar SHA do arquivo atual
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const fileData = await fileRes.json();
    const sha = fileData.sha;

    // Atualizar o arquivo
    const updateRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: Buffer.from(content).toString("base64"),
          sha,
          branch,
        }),
      }
    );

    const result = await updateRes.json();

    if (updateRes.ok) {
      return res.status(200).json({
        message: "Atualizado com sucesso",
        commit: result.commit.sha,
      });
    } else {
      return res.status(400).json({ error: result.message });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export const config = { runtime: "edge" };
