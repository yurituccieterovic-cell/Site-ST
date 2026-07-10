/**
 * ISA Bibliotecário — extensão do ciclo autônomo ISA.
 * Roda 6x/dia (a cada 4h). Fontes:
 *   1. isa_memory (contextos: chat, biblioteca, cycle)
 *   2. assembly_messages (inter-agentes PAP)
 *   3. Fontes curadas FUVEST/ENEM/Unicamp (HTML scan → PDFs)
 *   4. SalesCockpit arvore_chat via bridge
 * Registra na tabela biblioteca_docs (persistente). Re-hidrata arquivos
 * perdidos no /tmp na próxima execução (Railway restart).
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import { isaMemoryTable, bibliotecaDocsTable, assemblyMessages } from "@workspace/db";
import { gte, eq, and, isNotNull, sql } from "drizzle-orm";
import OpenAI from "openai";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";
import { getScArvoreChat } from "../lib/salescockpit-bridge";
import { logger } from "../lib/logger";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const BIBLIOTECA_DIR = process.env.BIBLIOTECA_DIR ?? "/tmp/pap-biblioteca";

export interface BibliotecaItem {
  titulo: string;
  url: string;
  tipo: "pdf" | "html" | "txt";
  origem: string;
  baixadoEm: string;
  tamanhoBytes?: number;
}

// Pastas do Google Drive que o bibliotecário monitora automaticamente
// Formato: "FOLDER_ID|Nome da pasta|tag1,tag2"
const DRIVE_FOLDERS = (process.env.BIBLIOTECA_DRIVE_FOLDERS ?? "1f19Svg4zO-srvhruOuv_W3mez4Wx775m|Livros PAP|assembleia,pap")
  .split(";")
  .map((s) => { const [id, nome, tags] = s.split("|"); return { id: id?.trim(), nome: nome?.trim() ?? "Drive", tags: (tags ?? "").split(",").map((t) => t.trim()) }; })
  .filter((f) => f.id);

// Fontes curadas verificadas a cada ciclo de 4h
const CURATED_SOURCES = [
  {
    nome: "FUVEST — Provas e Gabaritos",
    url: "https://www.fuvest.br/provas-e-gabaritos/",
    tags: ["fuvest", "prova", "gabarito"],
  },
  {
    nome: "ENEM — Provas e Gabaritos (INEP)",
    url: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos",
    tags: ["enem", "prova", "gabarito"],
  },
  {
    nome: "COMVEST Unicamp — Provas Anteriores",
    url: "https://www.comvest.unicamp.br/vestibular/anteriores/",
    tags: ["unicamp", "vestibular"],
  },
  {
    nome: "UEL — Vestibular Provas",
    url: "https://www.uel.br/prograd/cops/pages/vestibular/provas.php",
    tags: ["uel", "vestibular"],
  },
];

function ensureDir() {
  if (!fs.existsSync(BIBLIOTECA_DIR)) {
    fs.mkdirSync(BIBLIOTECA_DIR, { recursive: true });
  }
}

async function downloadFile(url: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ISA-Bibliotecario/1.0)" },
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("pdf") && !ct.includes("octet-stream") && !ct.includes("html") && !ct.includes("text")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 500) return null; // muito pequeno = provável erro
    const filePath = path.join(BIBLIOTECA_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch {
    return null;
  }
}

async function extractPdfUrls(text: string): Promise<{ url: string; titulo: string }[]> {
  // Extração regex rápida — sem LLM, sem custo
  const urlRe = /https?:\/\/[^\s"'<>)]+\.pdf(\?[^\s"'<>)]*)?/gi;
  const found = [...new Set(text.match(urlRe) ?? [])];
  return found.slice(0, 20).map((url) => ({
    url,
    titulo: decodeURIComponent(url.split("/").pop()?.replace(/\.pdf.*/i, "") ?? "Documento"),
  }));
}

async function extractPdfUrlsAI(text: string): Promise<{ url: string; titulo: string }[]> {
  const prompt = `Analise o texto e extraia URLs de PDFs educacionais (vestibular, FUVEST, ENEM, apostilas, provas).
Retorne JSON: [{"url": "...", "titulo": "..."}] ou [].
Ignore URLs de vídeos, redes sociais e imagens.
TEXTO: ${text.slice(0, 3000)}`;
  if (!openai) return [];
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 400,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });
    const raw = res.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { urls?: { url: string; titulo: string }[] } | { url: string; titulo: string }[];
    if (Array.isArray(parsed)) return parsed;
    return (parsed as { urls?: { url: string; titulo: string }[] }).urls ?? [];
  } catch {
    return [];
  }
}

async function extractPdfLinksFromHtml(html: string, baseUrl: string): Promise<{ url: string; titulo: string }[]> {
  const results: { url: string; titulo: string }[] = [];
  // Match <a href="...pdf..."> links
  const re = /href=["']([^"']*\.pdf[^"']*?)["'][^>]*>([^<]*)</gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    let url = m[1];
    const titulo = m[2].trim() || url.split("/").pop() || "Documento";
    if (!url.startsWith("http")) {
      try { url = new URL(url, baseUrl).href; } catch { continue; }
    }
    results.push({ url, titulo });
  }
  return results.slice(0, 30);
}

async function alreadyInDb(url: string): Promise<boolean> {
  const rows = await db
    .select({ id: bibliotecaDocsTable.id })
    .from(bibliotecaDocsTable)
    .where(sql`${bibliotecaDocsTable.url} = ${url}`)
    .limit(1);
  return rows.length > 0;
}

async function saveDocToDb(titulo: string, url: string | null, localPath: string | null, tipo: string, origem: string, tags: string[], tamanhoBytes?: number): Promise<void> {
  await db.insert(bibliotecaDocsTable).values({
    titulo,
    url,
    localPath,
    tipo,
    origem,
    tamanhoBytes,
    tags,
  }).onConflictDoNothing();
}

/** Re-hidrata arquivos perdidos no /tmp (Railway restart) — re-baixa se URL ainda existe */
async function rehydrateEphemeralFiles(): Promise<void> {
  ensureDir();
  const docs = await db
    .select({ id: bibliotecaDocsTable.id, url: bibliotecaDocsTable.url, localPath: bibliotecaDocsTable.localPath, titulo: bibliotecaDocsTable.titulo })
    .from(bibliotecaDocsTable)
    .where(isNotNull(bibliotecaDocsTable.url));

  let rehydrated = 0;
  for (const doc of docs) {
    if (!doc.localPath || !doc.url) continue;
    if (fs.existsSync(doc.localPath)) continue; // já está em disco
    const filename = path.basename(doc.localPath);
    const newPath = await downloadFile(doc.url, filename);
    if (newPath) {
      await db.update(bibliotecaDocsTable)
        .set({ localPath: newPath })
        .where(sql`${bibliotecaDocsTable.id} = ${doc.id}`);
      rehydrated++;
    }
  }
  if (rehydrated > 0) logger.info({ rehydrated }, "ISA Bibliotecário: re-hidratou arquivos do /tmp");
}

/** Scan de fontes curadas (FUVEST/ENEM/Unicamp) */
async function scanCuratedSources(): Promise<BibliotecaItem[]> {
  const baixados: BibliotecaItem[] = [];
  for (const source of CURATED_SOURCES) {
    try {
      const res = await fetch(source.url, {
        signal: AbortSignal.timeout(20_000),
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ISA-Bibliotecario/1.0)" },
      });
      if (!res.ok) continue;
      const html = await res.text();
      const links = await extractPdfLinksFromHtml(html, source.url);

      for (const { url, titulo } of links) {
        if (await alreadyInDb(url)) continue;
        const filename = `${Date.now()}-${titulo.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.pdf`;
        const localPath = await downloadFile(url, filename);
        const tamanhoBytes = localPath ? fs.statSync(localPath).size : undefined;

        const item: BibliotecaItem = {
          titulo: `[${source.nome}] ${titulo}`,
          url,
          tipo: "pdf",
          origem: source.nome.toLowerCase().replace(/\s/g, "-"),
          baixadoEm: new Date().toISOString(),
          tamanhoBytes,
        };
        baixados.push(item);
        await saveDocToDb(item.titulo, url, localPath, "pdf", item.origem, source.tags, tamanhoBytes);
      }
    } catch (err) {
      logger.warn({ err, source: source.nome }, "ISA Bibliotecário: falha ao escanear fonte curada");
    }
  }
  return baixados;
}

/** Scan de conversas recentes (isa_memory + assembly_messages) */
async function scanConversations(sinceHours = 4): Promise<BibliotecaItem[]> {
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
  const baixados: BibliotecaItem[] = [];

  // 1. isa_memory (todos os contextos)
  const memorias = await db
    .select({ content: isaMemoryTable.content })
    .from(isaMemoryTable)
    .where(gte(isaMemoryTable.createdAt, since))
    .limit(100);

  // 2. assembly_messages (inter-agentes)
  const msgs = await db
    .select({ content: assemblyMessages.content })
    .from(assemblyMessages)
    .where(gte(assemblyMessages.createdAt, since))
    .limit(100);

  const allText = [...memorias, ...msgs].map((m) => m.content).join("\n\n");
  if (!allText.trim()) return baixados;

  // Extração: regex primeiro (sem custo), depois AI se regex não encontrou nada
  let urls = await extractPdfUrls(allText);
  if (urls.length === 0 && openai) {
    urls = await extractPdfUrlsAI(allText);
  }

  for (const { url, titulo } of urls) {
    if (await alreadyInDb(url)) continue;
    const filename = `${Date.now()}-${titulo.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.pdf`;
    const localPath = await downloadFile(url, filename);
    const tamanhoBytes = localPath ? fs.statSync(localPath).size : undefined;
    const item: BibliotecaItem = {
      titulo,
      url,
      tipo: url.toLowerCase().endsWith(".pdf") ? "pdf" : "html",
      origem: "conversa",
      baixadoEm: new Date().toISOString(),
      tamanhoBytes,
    };
    baixados.push(item);
    await saveDocToDb(titulo, url, localPath, item.tipo, "conversa", ["conversa", "auto"], tamanhoBytes);
  }
  return baixados;
}

/** Scan do SalesCockpit (arvore_chat via bridge) */
async function scanSalesCockpit(): Promise<BibliotecaItem[]> {
  const baixados: BibliotecaItem[] = [];
  const entries = await getScArvoreChat(200);
  if (entries.length === 0) return baixados;

  const text = entries.map((e) => e.content).join("\n\n");
  const urls = await extractPdfUrls(text);

  for (const { url, titulo } of urls) {
    if (await alreadyInDb(url)) continue;
    const filename = `${Date.now()}-sc-${titulo.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.pdf`;
    const localPath = await downloadFile(url, filename);
    const tamanhoBytes = localPath ? fs.statSync(localPath).size : undefined;
    const item: BibliotecaItem = {
      titulo: `[SalesCockpit] ${titulo}`,
      url,
      tipo: url.toLowerCase().endsWith(".pdf") ? "pdf" : "html",
      origem: "salescockpit",
      baixadoEm: new Date().toISOString(),
      tamanhoBytes,
    };
    baixados.push(item);
    await saveDocToDb(item.titulo, url, localPath, item.tipo, "salescockpit", ["salescockpit", "arvore"], tamanhoBytes);
  }

  // Também importa assembleias do SC como documentos txt
  const { getScDocs } = await import("../lib/salescockpit-bridge");
  const scDocs = await getScDocs();
  for (const doc of scDocs) {
    if (!doc.titulo) continue;
    const existing = await db
      .select({ id: bibliotecaDocsTable.id })
      .from(bibliotecaDocsTable)
      .where(sql`${bibliotecaDocsTable.titulo} = ${doc.titulo}`)
      .limit(1);
    if (existing.length > 0) continue;
    await saveDocToDb(doc.titulo, doc.url, null, "txt", "salescockpit", ["salescockpit", "assembleia"]);
    baixados.push({ titulo: doc.titulo, url: doc.url ?? "", tipo: "txt", origem: "salescockpit", baixadoEm: new Date().toISOString() });
  }

  return baixados;
}

/** Scan de pastas Google Drive públicas via gdown (Python) */
async function scanDriveFolders(): Promise<BibliotecaItem[]> {
  if (DRIVE_FOLDERS.length === 0) return [];
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execFileAsync = promisify(execFile);
  const baixados: BibliotecaItem[] = [];

  for (const folder of DRIVE_FOLDERS) {
    try {
      const tmpDir = `${BIBLIOTECA_DIR}/drive-${folder.id}`;
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      // Usa gdown Python para baixar apenas arquivos novos
      const script = `
import gdown, os, json, sys
folder_url = "https://drive.google.com/drive/folders/${folder.id}"
try:
    files = gdown.download_folder(folder_url, output="${tmpDir}", quiet=True, use_cookies=False, skip_download=False)
    print(json.dumps(files or []))
except Exception as e:
    print(json.dumps([]))
`;
      const { stdout } = await execFileAsync("python3", ["-c", script], { timeout: 120_000 });
      const downloaded: string[] = JSON.parse(stdout.trim() || "[]");
      for (const fp of downloaded) {
        if (!fp || typeof fp !== "string") continue;
        const fname = path.basename(fp);
        const titulo = `[${folder.nome}] ${fname.replace(/\.[^.]+$/, "")}`;
        const existing = await db.select({ id: bibliotecaDocsTable.id }).from(bibliotecaDocsTable)
          .where(sql`${bibliotecaDocsTable.titulo} = ${titulo}`).limit(1);
        if (existing.length > 0) continue;
        const stat = fs.existsSync(fp) ? fs.statSync(fp) : null;
        const item: BibliotecaItem = {
          titulo,
          url: null as unknown as string,
          tipo: fp.endsWith(".pdf") ? "pdf" : fp.endsWith(".html") ? "html" : "txt",
          origem: `drive-${folder.id}`,
          baixadoEm: new Date().toISOString(),
          tamanhoBytes: stat?.size,
        };
        baixados.push(item);
        await saveDocToDb(titulo, null, fp, item.tipo, `drive-${folder.id}`, folder.tags, stat?.size);
      }
    } catch (err) {
      logger.warn({ err, folderId: folder.id }, "ISA Bibliotecário: falha ao escanear pasta Drive");
    }
  }
  return baixados;
}

/** Ciclo principal — 6x/dia (chamado a cada 4h) */
export async function runBibliotecario(): Promise<{ baixados: number; itens: BibliotecaItem[] }> {
  ensureDir();
  await rehydrateEphemeralFiles();

  const [fromConversas, fromCurated, fromSC, fromDrive] = await Promise.all([
    scanConversations(4),
    scanCuratedSources(),
    scanSalesCockpit(),
    scanDriveFolders(),
  ]);

  const itens = [...fromConversas, ...fromCurated, ...fromSC, ...fromDrive];

  if (itens.length > 0) {
    await db.insert(isaMemoryTable).values({
      userId: null,
      userEmail: null,
      context: "biblioteca",
      role: "isa",
      content: `📚 Bibliotecário: ${itens.length} doc(s) novos adicionados — ${itens.map((i) => i.titulo).join("; ").slice(0, 400)}`,
      location: "/biblioteca",
      sessionId: `bib-${Date.now()}`,
      metadata: { itens: itens.map((i) => ({ titulo: i.titulo, origem: i.origem })) },
    });
  }

  return { baixados: itens.length, itens };
}
