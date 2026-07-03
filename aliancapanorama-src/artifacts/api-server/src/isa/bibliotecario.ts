/**
 * ISA Bibliotecário — extensão do ciclo autônomo ISA.
 * A cada hora, analisa conversas recentes das assembleias e baixa PDFs
 * referenciados ou gerados. Salva referências na tabela isa_memory.
 */
import fs from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import { isaMemoryTable, bibliotecaDocsTable } from "@workspace/db";
import { gte, eq, and } from "drizzle-orm";
import OpenAI from "openai";

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

/** Garante que o diretório da biblioteca existe */
function ensureDir() {
  if (!fs.existsSync(BIBLIOTECA_DIR)) {
    fs.mkdirSync(BIBLIOTECA_DIR, { recursive: true });
  }
}

/** Baixa um URL e salva em disco, retornando o path local */
async function downloadFile(url: string, filename: string): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = path.join(BIBLIOTECA_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  } catch {
    return null;
  }
}

/** Usa GPT para extrair URLs de PDFs/documentos de um texto de assembleia */
async function extractPdfUrls(text: string): Promise<{ url: string; titulo: string }[]> {
  const prompt = `Analise o texto abaixo e extraia APENAS URLs de PDFs, documentos ou arquivos que devem ser baixados para uma biblioteca de conhecimento.
Retorne JSON: [{"url": "...", "titulo": "..."}] ou [] se não houver URLs.
Ignore URLs de vídeos YouTube, redes sociais e imagens.

TEXTO:
${text.slice(0, 4000)}`;

  if (!openai) return [];
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 500,
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

/** Ciclo principal do Bibliotecário */
export async function runBibliotecario(): Promise<{ baixados: number; itens: BibliotecaItem[] }> {
  ensureDir();

  // Busca conversas recentes da ISA (últimas 2h de assembleias)
  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const memorias = await db
    .select()
    .from(isaMemoryTable)
    .where(
      and(
        gte(isaMemoryTable.createdAt, new Date(since)),
        eq(isaMemoryTable.context, "chat"),
      )
    )
    .limit(50);

  const textoRecente = memorias.map((m) => m.content).join("\n\n");
  if (!textoRecente.trim()) return { baixados: 0, itens: [] };

  const urls = await extractPdfUrls(textoRecente);
  const baixados: BibliotecaItem[] = [];

  for (const { url, titulo } of urls) {
    const filename = `${Date.now()}-${titulo.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50)}.pdf`;
    const localPath = await downloadFile(url, filename);
    if (!localPath) continue;

    const stat = fs.statSync(localPath);
    const item: BibliotecaItem = {
      titulo,
      url,
      tipo: url.endsWith(".pdf") ? "pdf" : "html",
      origem: "assembleia-chat",
      baixadoEm: new Date().toISOString(),
      tamanhoBytes: stat.size,
    };

    baixados.push(item);

    // Registra na biblioteca de documentos
    await db.insert(bibliotecaDocsTable).values({
      titulo,
      url,
      localPath: localPath,
      tipo: url.endsWith(".pdf") ? "pdf" : "html",
      origem: "bibliotecario",
      tamanhoBytes: stat.size,
      tags: ["assembleia", "auto"],
    }).onConflictDoNothing();

    // Registra na memória da ISA
    await db.insert(isaMemoryTable).values({
      userId: null,
      userEmail: null,
      context: "biblioteca",
      role: "isa",
      content: `📚 Bibliotecário baixou: "${titulo}" (${Math.round(stat.size / 1024)}KB) — ${url}`,
      location: "/biblioteca",
      sessionId: `bib-${Date.now()}`,
      metadata: item,
    });
  }

  return { baixados: baixados.length, itens: baixados };
}
