#!/usr/bin/env node
/**
 * MCP Server — Replit Bridge
 * Expõe ferramentas para Claude Code ler, editar e sincronizar
 * projetos Replit diretamente desta sessão.
 *
 * Secrets necessários (em .pap-secrets):
 *   REPLIT_TOKEN    — API key de replit.com/account → API keys
 *   REPLIT_USERNAME — seu username no Replit (@handle)
 */

const { McpServer }            = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z }                    = require("zod");
const { execSync, exec }       = require("child_process");
const fs                       = require("fs");
const path                     = require("path");
const https                    = require("https");

const TOKEN      = process.env["REPLIT_TOKEN"]    ?? "";
const USERNAME   = process.env["REPLIT_USERNAME"]  ?? "";
const CLONE_ROOT = process.env["REPLIT_CLONE_DIR"] ?? "/tmp/replit-clones";

if (!fs.existsSync(CLONE_ROOT)) fs.mkdirSync(CLONE_ROOT, { recursive: true });

// ── Replit REST API ──────────────────────────────────────────────────────────

function replitApi(apiPath) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "replit.com",
      path:     `/api/v0${apiPath}`,
      method:   "GET",
      headers:  { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end",  () => { try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); } });
    });
    req.on("error", reject);
    req.end();
  });
}

// ── Git helpers ──────────────────────────────────────────────────────────────

const cloneDir = slug => path.join(CLONE_ROOT, slug);

function gitUrl(slug) {
  return `https://${USERNAME}:${TOKEN}@replit.com/@${USERNAME}/${slug}.git`;
}

function run(cmd, cwd) {
  return execSync(cmd, { cwd, encoding: "utf8", stdio: ["pipe","pipe","pipe"] });
}

function ensureCloned(slug) {
  const dir = cloneDir(slug);
  if (!fs.existsSync(dir)) {
    execSync(`git clone "${gitUrl(slug)}" "${dir}"`, { encoding: "utf8" });
  }
  return dir;
}

// ── MCP Server ────────────────────────────────────────────────────────────────

const server = new McpServer({ name: "replit-bridge", version: "1.0.0" });

// 1. Listar repls
server.tool(
  "replit_list_repls",
  "Lista os projetos (repls) do usuário Replit via API.",
  { limit: z.number().optional().describe("Máximo de repls (padrão 20)") },
  async ({ limit = 20 }) => {
    if (!TOKEN) return { content: [{ type: "text", text: "REPLIT_TOKEN não configurado" }] };
    const data = await replitApi(`/repls?count=${limit}`);
    const repls = (data.items ?? data.repls ?? []).map(r => ({
      slug:     r.slug,
      title:    r.title ?? r.slug,
      url:      `https://replit.com/@${USERNAME}/${r.slug}`,
      language: r.language ?? r.lang,
    }));
    return { content: [{ type: "text", text: JSON.stringify({ repls }, null, 2) }] };
  }
);

// 2. Listar arquivos de um repl
server.tool(
  "replit_list_files",
  "Lista arquivos de um repl (clona localmente via git se necessário).",
  {
    slug:   z.string().describe("Slug do repl (ex: arvore-pap)"),
    subdir: z.string().optional().describe("Subdiretório (padrão: raiz)"),
  },
  async ({ slug, subdir = "" }) => {
    if (!USERNAME || !TOKEN) return { content: [{ type: "text", text: "REPLIT_USERNAME e REPLIT_TOKEN necessários" }] };
    try {
      const dir  = ensureCloned(slug);
      const base = subdir ? path.join(dir, subdir) : dir;
      if (!fs.existsSync(base)) return { content: [{ type: "text", text: `Diretório '${subdir}' não encontrado` }] };
      const entries = fs.readdirSync(base, { withFileTypes: true })
        .filter(e => !e.name.startsWith(".git"))
        .map(e => `${e.isDirectory() ? "📁" : "📄"} ${e.name}`);
      return { content: [{ type: "text", text: `${slug}/${subdir || ""}\n\n${entries.join("\n")}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Erro ao clonar: ${e.message}` }] };
    }
  }
);

// 3. Ler arquivo
server.tool(
  "replit_read_file",
  "Lê o conteúdo de um arquivo de um repl.",
  {
    slug:     z.string().describe("Slug do repl"),
    filepath: z.string().describe("Caminho relativo do arquivo (ex: arvore.py)"),
  },
  async ({ slug, filepath }) => {
    try {
      const dir      = ensureCloned(slug);
      const fullPath = path.join(dir, filepath);
      if (!fs.existsSync(fullPath)) return { content: [{ type: "text", text: `Arquivo não encontrado: ${filepath}` }] };
      const content = fs.readFileSync(fullPath, "utf8");
      return { content: [{ type: "text", text: `// ${slug}/${filepath}\n\n${content}` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Erro: ${e.message}` }] };
    }
  }
);

// 4. Escrever arquivo + auto-push
server.tool(
  "replit_write_file",
  "Escreve/edita um arquivo num repl e faz git commit + push automático para o Replit.",
  {
    slug:          z.string().describe("Slug do repl"),
    filepath:      z.string().describe("Caminho relativo do arquivo"),
    content:       z.string().describe("Conteúdo completo do arquivo"),
    commitMessage: z.string().optional().describe("Mensagem de commit"),
    autoPush:      z.boolean().optional().describe("Fazer push imediato (padrão true)"),
  },
  async ({ slug, filepath, content, commitMessage, autoPush = true }) => {
    try {
      const dir      = ensureCloned(slug);
      const fullPath = path.join(dir, filepath);
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf8");
      run(`git add "${filepath}"`, dir);
      const msg = (commitMessage ?? `claude: editar ${filepath}`).replace(/"/g, "'");
      try { run(`git commit -m "${msg}"`, dir); }
      catch (e) {
        if (String(e).includes("nothing to commit")) return { content: [{ type: "text", text: "Sem alterações para commitar." }] };
        throw e;
      }
      if (autoPush) run("git push origin HEAD", dir);
      return { content: [{ type: "text", text: `✅ ${filepath} salvo e ${autoPush ? "enviado ao Replit" : "commitado localmente"}.` }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Erro: ${e.message}` }] };
    }
  }
);

// 5. Pull (sincronizar com remoto)
server.tool(
  "replit_pull",
  "Sincroniza o clone local com o Replit remoto (git pull).",
  { slug: z.string().describe("Slug do repl") },
  async ({ slug }) => {
    try {
      const dir = ensureCloned(slug);
      const out = run("git pull --rebase origin HEAD", dir);
      return { content: [{ type: "text", text: out.trim() || "Já atualizado." }] };
    } catch (e) {
      return { content: [{ type: "text", text: `Erro: ${e.message}` }] };
    }
  }
);

// 6. Executar comando local no clone
server.tool(
  "replit_run_command",
  "Executa um comando shell no clone LOCAL do repl (não no Replit remoto — útil para testes locais).",
  {
    slug:    z.string().describe("Slug do repl"),
    command: z.string().describe("Comando shell"),
  },
  async ({ slug, command }) => {
    const dir = cloneDir(slug);
    if (!fs.existsSync(dir)) return { content: [{ type: "text", text: `Repl '${slug}' não clonado. Use replit_list_files primeiro.` }] };
    return new Promise(resolve => {
      exec(command, { cwd: dir, timeout: 30_000 }, (err, stdout, stderr) => {
        const out = [stdout.slice(0,3000), stderr ? `[stderr] ${stderr.slice(0,500)}` : ""].filter(Boolean).join("\n");
        resolve({ content: [{ type: "text", text: out || "(sem saída)" }] });
      });
    });
  }
);

// ── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
server.connect(transport).then(() => {
  process.stderr.write("[replit-mcp] pronto\n");
});
