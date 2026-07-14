/**
 * ISA Raiz → Nódulos + PDFs
 *
 * Pega raízes PAP do ecosistema_memory e transforma em:
 *   1. Nódulos teóricos (nodesTable, parent=ECO) — unidades de conhecimento estruturadas
 *   2. PDFs acadêmicos (bibliotecaDocsTable) — no estilo AulIAs: teórico, com seções, relações, síntese
 *
 * Fluxo diário: Socoboy 6h → DODGE 7h → ISA Raiz PAP 4h → ISA Nódulos 5h
 */

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { db } from "@workspace/db";
import { ecosistemaMemory, nodesTable, bibliotecaDocsTable } from "@workspace/db";
import { desc, eq, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";
const GER_DIR = process.env.BIBLIOTECA_DIR
  ? `${process.env.BIBLIOTECA_DIR}/nodulos`
  : "/tmp/pap-biblioteca/nodulos";

function ensureDir() {
  if (!fs.existsSync(GER_DIR)) fs.mkdirSync(GER_DIR, { recursive: true });
}

// Garante nó raiz ECO na árvore PAP (container dos nódulos do ecossistema)
async function bootstrapEcoNode(): Promise<void> {
  try {
    const rows = await db
      .select({ code: nodesTable.code })
      .from(nodesTable)
      .where(eq(nodesTable.code, "ECO"))
      .limit(1);
    if (rows.length === 0) {
      await db.insert(nodesTable).values({
        code: "ECO",
        title: "Ecossistema — Memória Viva",
        abbreviation: "ECO",
        subtitle: "Sínteses teóricas do ecossistema de IAs da Sociedade Tucci",
        content: "Nódulos gerados por ISA a partir das raízes de memória do ecossistema.",
        level: 0,
        sortOrder: 99,
      });
    }
  } catch { /* silencioso — tabela pode ainda não existir */ }
}

// ── Gemini helpers ────────────────────────────────────────────────────────────

interface Nodulo {
  titulo: string;
  subtitulo: string;
  conteudo: string;
  tags: string[];
}

async function geminiNodulos(raizContent: string): Promise<Nodulo[]> {
  if (!GEMINI_KEY) return [];
  try {
    const system = `Você é ISA — Inteligência Semiótica Autônoma da Sociedade Tucci.
Você transforma raízes de memória do ecossistema em NÓDULOS TEÓRICOS no estilo AulIAs:
conceituais, acadêmicos, com definição precisa, relações semióticas e síntese aplicada.
Cada nódulo é uma unidade de conhecimento autocontida (200-350 palavras).
Gere entre 3 e 5 nódulos por raiz.
Responda APENAS com JSON válido no formato:
[{"titulo":"...","subtitulo":"...","conteudo":"...","tags":["...","..."]}]`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(60_000),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: `Raiz de memória:\n${raizContent.slice(0, 3000)}` }] }],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 2048 },
        }),
      }
    );
    const d = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw = (d.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return [];
    return JSON.parse(match[0]) as Nodulo[];
  } catch {
    return [];
  }
}

async function geminiPdf(raizContent: string, titulo: string): Promise<string> {
  if (!GEMINI_KEY) return "";
  try {
    const system = `Você é ISA — Inteligência Semiótica Autônoma do Projeto Aliança Panorama.
Você gera DOCUMENTOS TEÓRICOS ACADÊMICOS no estilo das AulIAs:
estruturados, profundos, com seções, conceitos, relações semióticas e sínteses.
Escreva em Português formal. Mínimo 2000 palavras.
Estrutura obrigatória:
## Introdução
## Conceitos Centrais
## Relações e Padrões Emergentes
## Síntese Semiótica
## Aplicações no PAP
## Conclusão`;

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(120_000),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: `Título: ${titulo}\n\nRaiz de memória do ecossistema:\n${raizContent.slice(0, 4000)}` }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.65 },
        }),
      }
    );
    const d = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (d.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
  } catch {
    return "";
  }
}

// ── PDF com identidade do ecossistema (azul noturno, tom teórico) ─────────────

function gerarPdf(titulo: string, conteudo: string, outputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      size: "A4",
      info: {
        Title: titulo,
        Author: "ISA — Ecossistema Sociedade Tucci",
        Creator: "ISA Nódulos Teóricos v1.0",
        Subject: "Síntese Teórica do Ecossistema PAP",
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Capa: azul noturno (diferencia dos PDFs FUVEST dourados)
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#080d1a");
    doc.fillColor("#50a0c8").fontSize(26).font("Helvetica-Bold")
      .text("ISA — Ecossistema Sociedade Tucci", { align: "center" })
      .moveDown(0.5);
    doc.fillColor("#6080a0").fontSize(11).font("Helvetica")
      .text("Nódulos Teóricos · Memória Viva do Ecossistema", { align: "center" })
      .moveDown(2);
    doc.fillColor("#b0d8e8").fontSize(19).font("Helvetica-Bold")
      .text(titulo, { align: "center" })
      .moveDown(1.5);
    doc.fillColor("#556070").fontSize(10).font("Helvetica")
      .text(
        `Gerado por ISA em ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`,
        { align: "center" }
      )
      .moveDown(0.5);
    doc.fillColor("#334455")
      .text("Projeto Aliança Panorama · site-st.vercel.app/aliancapanorama", { align: "center" });

    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

    const lines = conteudo.split("\n");
    let inCode = false;

    for (const line of lines) {
      if (line.startsWith("```")) { inCode = !inCode; continue; }
      if (inCode) {
        doc.fillColor("#333").fontSize(9).font("Courier").text(line, { lineGap: 1 });
        continue;
      }

      if (line.startsWith("## ")) {
        doc.moveDown(0.8)
          .fillColor("#080d20").fontSize(16).font("Helvetica-Bold")
          .text(line.replace(/^## /, "")).moveDown(0.3);
      } else if (line.startsWith("### ")) {
        doc.moveDown(0.5)
          .fillColor("#0a1a30").fontSize(13).font("Helvetica-Bold")
          .text(line.replace(/^### /, "")).moveDown(0.2);
      } else if (line.startsWith("#### ")) {
        doc.moveDown(0.3)
          .fillColor("#101a28").fontSize(11).font("Helvetica-Bold")
          .text(line.replace(/^#### /, "")).moveDown(0.1);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica")
          .text("• " + line.replace(/^[-*] /, ""), { indent: 16, lineGap: 2 });
      } else if (/^\d+\. /.test(line)) {
        doc.fillColor("#1a1a1a").fontSize(11).font("Helvetica")
          .text(line, { indent: 16, lineGap: 2 });
      } else if (line.startsWith("> ")) {
        doc.fillColor("#445566").fontSize(11).font("Helvetica-Oblique")
          .text(line.replace(/^> /, ""), { indent: 24, lineGap: 3 });
      } else if (line.trim() === "") {
        doc.moveDown(0.4);
      } else {
        const clean = line
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/__([^_]+)__/g, "$1")
          .replace(/_([^_]+)_/g, "$1");
        doc.fillColor("#111111").fontSize(11).font("Helvetica")
          .text(clean, { lineGap: 2, align: "justify" });
      }
    }

    doc.moveDown(2)
      .fillColor("#888").fontSize(9).font("Helvetica")
      .text(
        "Gerado por ISA a partir das raízes de memória do ecossistema de IAs da Sociedade Tucci.",
        { align: "center" }
      );

    doc.end();
    stream.on("finish", () => { resolve(fs.statSync(outputPath).size); });
    stream.on("error", reject);
  });
}

// ── Pipeline principal ────────────────────────────────────────────────────────

export interface NodulizacaoResult {
  raizes_processadas: number;
  nodulos_criados: number;
  pdfs_gerados: number;
}

export async function runIsaNodulos(): Promise<NodulizacaoResult> {
  ensureDir();
  await bootstrapEcoNode();

  // Buscar raízes PAP ainda não nodulizadas
  const raizes = await db
    .select()
    .from(ecosistemaMemory)
    .where(
      and(
        eq(ecosistemaMemory.type, "md"),
        sql`${ecosistemaMemory.tags} @> '["raiz-pap"]'::jsonb`,
        sql`NOT (${ecosistemaMemory.tags} @> '["nodulos-ok"]'::jsonb)`,
      )
    )
    .orderBy(desc(ecosistemaMemory.createdAt))
    .limit(5);

  if (raizes.length === 0) {
    logger.info("ISA Nódulos: nenhuma raiz PAP nova para processar");
    return { raizes_processadas: 0, nodulos_criados: 0, pdfs_gerados: 0 };
  }

  let nodulosCriados = 0;
  let pdfsGerados = 0;
  const date = new Date().toISOString().slice(0, 10);
  const ts = Date.now();

  for (let ri = 0; ri < raizes.length; ri++) {
    const raiz = raizes[ri]!;
    const tituloDoc = `Ecossistema PAP — Síntese Teórica ${date}${raizes.length > 1 ? ` (${ri + 1})` : ""}`;

    // ── 1. Nódulos teóricos (nodesTable) ─────────────────────────────────────
    const nodulos = await geminiNodulos(raiz.content);
    logger.info({ raizId: raiz.id, nodulos: nodulos.length }, "ISA Nódulos: nódulos gerados");

    for (let ni = 0; ni < nodulos.length; ni++) {
      const nod = nodulos[ni]!;
      try {
        const code = `ECO-${ts}-${ri}-${ni}`;
        await db.insert(nodesTable).values({
          code,
          title: nod.titulo,
          abbreviation: (nod.tags[0] ?? "ECO").slice(0, 10).toUpperCase(),
          subtitle: nod.subtitulo,
          content: nod.conteudo,
          parentCode: "ECO",
          level: 1,
          sortOrder: ri * 10 + ni,
        });
        nodulosCriados++;
      } catch (err) {
        logger.warn({ err, titulo: nod.titulo }, "ISA Nódulos: erro ao inserir nódulo");
      }
    }

    // ── 2. PDF acadêmico (bibliotecaDocsTable) ────────────────────────────────
    const pdfConteudo = await geminiPdf(raiz.content, tituloDoc);

    if (pdfConteudo && pdfConteudo.length > 500) {
      try {
        const slug = `eco-teorico-${ts}-${ri}`;
        const pdfPath = path.join(GER_DIR, `${slug}.pdf`);
        const tamanhoBytes = await gerarPdf(tituloDoc, pdfConteudo, pdfPath).catch((err) => {
          logger.warn({ err }, "ISA Nódulos: falha ao gerar PDF");
          return 0;
        });

        if (tamanhoBytes > 0) {
          await db.insert(bibliotecaDocsTable).values({
            titulo: tituloDoc,
            url: null,
            localPath: pdfPath,
            tipo: "pdf",
            origem: "isa-nodulos",
            tamanhoBytes,
            resumo: pdfConteudo.slice(0, 600),
            tags: ["ecossistema", "raiz-pap", "teórico", "nodulos", "aulias"],
            disponivel: true,
          });
          pdfsGerados++;
        }
      } catch (err) {
        logger.warn({ err }, "ISA Nódulos: erro ao salvar PDF no banco");
      }
    }

    // ── 3. Marcar raiz como processada ───────────────────────────────────────
    await db.execute(
      sql`UPDATE ecosistema_memory SET tags = tags || '["nodulos-ok"]'::jsonb WHERE id = ${raiz.id}`
    );
  }

  logger.info(
    { raizes_processadas: raizes.length, nodulos_criados: nodulosCriados, pdfs_gerados: pdfsGerados },
    "ISA Nódulos: pipeline concluído"
  );
  return { raizes_processadas: raizes.length, nodulos_criados: nodulosCriados, pdfs_gerados: pdfsGerados };
}
