/**
 * ISA Biblioteca Geradora — cria documentos originais 3x/dia.
 * Tópicos pertinentes ao PAP que não se encontram facilmente na internet:
 * análise cruzada, padrões ocultos FUVEST, metacognição, semiótica do vestibular.
 * Gera texto com Gemini (4000-8000 palavras) → converte em PDF com pdfkit.
 * Armazena em biblioteca_docs (origem: "isa-gerado").
 */

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { db, pool } from "@workspace/db";
import { bibliotecaDocsTable, isaMemoryTable } from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const GEMINI_KEY   = process.env.GEMINI_API_KEY   ?? "";
const GMAIL        = process.env.GMAIL_ACCOUNT     ?? "luddlocke@gmail.com";
const GMAIL_PASS   = process.env.GMAIL_APP_PASSWORD ?? "";
const LUDD         = "luddlocke@gmail.com";
const GER_DIR      = process.env.BIBLIOTECA_DIR
  ? `${process.env.BIBLIOTECA_DIR}/gerados`
  : "/tmp/pap-biblioteca/gerados";

// Bootstrap: garante coluna content_text na tabela (não existe no schema original)
async function bootstrapColumn(): Promise<void> {
  try {
    await pool.query(`
      ALTER TABLE biblioteca_docs
        ADD COLUMN IF NOT EXISTS content_text TEXT,
        ADD COLUMN IF NOT EXISTS gerado_por   TEXT DEFAULT 'isa';
    `);
  } catch {
    // coluna já existe ou tabela ainda não existe — ignorar silenciosamente
  }
}

function ensureDir() {
  if (!fs.existsSync(GER_DIR)) fs.mkdirSync(GER_DIR, { recursive: true });
}

// ── Tópicos rotativos: assuntos que a IA pode sintetizar melhor do que o Google ──
const TOPICOS = [
  {
    tema: "Padrões Ocultos FUVEST: O Que as Questões Dizem Sem Perguntar",
    instrucao: `Analise como a FUVEST formula questões com múltiplos níveis de leitura.
    Cubra: (1) estrutura semiótica das alternativas incorretas, (2) linguagem dos enunciados como pistas contextuais,
    (3) distribuição histórica de tópicos por área, (4) padrões de interdisciplinaridade,
    (5) como ler o gabarito para entender o que a banca valoriza, (6) estratégias de eliminação baseadas em lógica narrativa.
    Mínimo 4000 palavras, divididas em 8 seções com exemplos concretos.`,
    tags: ["fuvest", "análise", "padrões", "estratégia"],
  },
  {
    tema: "Metacognição e Performance: Como o Estudante de Alta Performance Aprende",
    instrucao: `Documento técnico sobre metacognição aplicada à preparação FUVEST.
    Cubra: (1) teoria do monitoramento cognitivo (Flavell), (2) espaçamento vs. maratonas de estudo — dados reais,
    (3) técnica de retrieval practice e por que supera releitura, (4) mapas conceituais como ferramentas de autoavaliação,
    (5) gestão emocional durante a preparação, (6) protocolo de revisão semanal eficaz,
    (7) como medir seu próprio progresso sem depender de ranking, (8) o papel do sono na consolidação de conteúdo FUVEST.
    Mínimo 4500 palavras com seções práticas e exercícios aplicáveis.`,
    tags: ["metacognição", "estudo", "performance", "psicologia"],
  },
  {
    tema: "Intersecções Invisíveis: Biologia, Filosofia e Literatura no Vestibular Brasileiro",
    instrucao: `Analise como conceitos de Biologia Evolutiva aparecem em questões de Filosofia e Literatura nos vestibulares.
    Cubra: (1) Darwin e a narrativa do progresso nas obras literárias do século XIX-XX,
    (2) conceito de nicho ecológico e personagens literários (de Machado a Guimarães Rosa),
    (3) evolução e determinismo social — como a biologia aparece implícita em textos filosóficos FUVEST,
    (4) DNA, memória e identidade em obras contemporâneas cobradas no vestibular,
    (5) pensamento sistêmico: de Gaia (Lovelock) às questões de ecologia FUVEST,
    (6) intersecções com Matemática (probabilidade genética em contexto cultural).
    Mínimo 4000 palavras. Citar questões reais ou simuladas.`,
    tags: ["biologia", "filosofia", "literatura", "interdisciplinar"],
  },
  {
    tema: "Semiótica do Texto de Vestibular: Como Decodificar Qualquer Enunciado",
    instrucao: `Guia semiótico para leitura de textos de vestibular.
    Cubra: (1) teoria dos signos (Peirce e Saussure) aplicada a enunciados de vestibular,
    (2) isotopias semânticas — por que certas palavras no enunciado "chamam" certas respostas,
    (3) análise de coerência e coesão nos textos de Língua Portuguesa FUVEST,
    (4) figuras de linguagem como pistas de resposta em textos literários,
    (5) como o contexto do texto-base elimina alternativas sem leitura integral,
    (6) estratégia de leitura em camadas: título → primeiro parágrafo → último → enunciado,
    (7) casos especiais: poesia, charge, infográfico — decodificação multimodal.
    Mínimo 4200 palavras, com exemplos textuais e análises passo a passo.`,
    tags: ["semiótica", "língua portuguesa", "estratégia", "leitura"],
  },
  {
    tema: "Geometria como Linguagem: Conexões entre Matemática e Humanidades no Vestibular",
    instrucao: `Documento que revela como o pensamento geométrico permeia disciplinas de humanas no vestibular.
    Cubra: (1) geometria euclidiana e arquitetura nas questões de história da arte FUVEST,
    (2) proporcionalidade matemática em estudos sociais e economia (Gini, curvas de Lorenz),
    (3) fractais e complexidade em questões de ecologia e filosofia da natureza,
    (4) probabilidade e retórica: como argumentos probabilísticos aparecem em textos filosóficos,
    (5) trigonometria e astronomia na história das civilizações (cobrado em história),
    (6) vetores e dinâmica social — forças, resultantes e conflitos sociais como metáfora geométrica,
    (7) exercícios que cruzam matemática e humanidades reais ou simulados.
    Mínimo 4000 palavras com diagramas descritos em texto.`,
    tags: ["matemática", "geometria", "humanidades", "interdisciplinar"],
  },
  {
    tema: "Análise Filosófica do Tempo: Da Física Quântica à Memória nos Textos do Vestibular",
    instrucao: `Explore o conceito de tempo como aparece em múltiplas disciplinas do vestibular.
    Cubra: (1) tempo em Física — relatividade, entropia e como aparecem em questões FUVEST,
    (2) tempo histórico vs. tempo cronológico (Braudel, Annales) em questões de história,
    (3) temporalidade narrativa em Língua Portuguesa (analepse, prolepse, flashback),
    (4) tempo e memória em filosofia (Bergson, Proust) — conexões com texto literário,
    (5) tempo biológico: ciclos, ritmo circadiano e evolução em questões de biologia,
    (6) tempo geológico e construção do pensamento ambiental no vestibular,
    (7) exercícios interdisciplinares sobre o conceito de tempo.
    Mínimo 4500 palavras com análises profundas e referências cruzadas.`,
    tags: ["filosofia", "física", "tempo", "interdisciplinar", "memória"],
  },
  {
    tema: "O Corpo no Vestibular: Biologia, Arte e Sociedade",
    instrucao: `Como o corpo humano aparece como tema central em múltiplas disciplinas do vestibular.
    Cubra: (1) o corpo biológico: sistema nervoso, hormônios e comportamento como tema em questões FUVEST,
    (2) o corpo social: representações do corpo em sociologia e antropologia no vestibular,
    (3) o corpo na arte: cânone estético ocidental vs. representações contemporâneas em questões de arte e literatura,
    (4) o corpo na filosofia: Descartes, Merleau-Ponty e o dualismo mente-corpo em textos filosóficos FUVEST,
    (5) saúde pública e o corpo coletivo: epidemiologia e biopolítica em questões de ciências,
    (6) o corpo feminino: representações e questões de gênero no vestibular contemporâneo,
    (7) o corpo tecnológico: biotecnologia, transgênicos e cyborgs em questões de biologia e filosofia.
    Mínimo 4200 palavras com análises textuais e estratégias.`,
    tags: ["biologia", "arte", "filosofia", "corpo", "interdisciplinar"],
  },
  {
    tema: "Estratégias de Revisão para os Últimos 30 Dias Antes da FUVEST",
    instrucao: `Guia prático e psicológico para os 30 dias finais de preparação FUVEST.
    Cubra: (1) o que revisar vs. o que deixar para trás — teoria do custo de oportunidade aplicada ao estudo,
    (2) simulado como ferramenta de calibração emocional (não só de conteúdo),
    (3) sono, alimentação e performance cognitiva — o que a ciência diz para a semana da prova,
    (4) gestão de ansiedade: técnicas cognitivo-comportamentais específicas para vestibulandos,
    (5) revisão de pontos fracos vs. manutenção de pontos fortes: equilíbrio estratégico,
    (6) cronograma-modelo dos últimos 30 dias com distribuição de matérias,
    (7) o que fazer na véspera: protocolos de descanso e ativação cognitiva,
    (8) erros comuns na reta final e como evitá-los.
    Mínimo 4000 palavras, altamente prático e acionável.`,
    tags: ["estratégia", "revisão", "FUVEST", "psicologia", "planejamento"],
  },
];

// ── Chamada Gemini com retry (máx 2 tentativas) ──────────────────────────────
async function geminiGerar(prompt: string, tentativa = 0): Promise<string> {
  if (!GEMINI_KEY) return "";
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(120_000),
        body: JSON.stringify({
          system_instruction: {
            parts: [{
              text: `Você é ISA — Inteligência Semiótica Autônoma da Sociedade Tucci / Projeto Aliança Panorama (PAP).
Você gera documentos educacionais originais, profundos e bem estruturados para preparação FUVEST.
Seu estilo é: preciso, didático, com exemplos concretos, linguagem clara mas sofisticada.
NUNCA invente dados falsos. Se citar questão de prova, indique claramente "questão simulada" ou "estilo FUVEST".
Escreva em Português do Brasil, formal mas acessível.
Estruture em seções claras com títulos (##) e subtítulos (###).`,
            }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7,
          },
        }),
      }
    );
    const data = await resp.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const texto = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
    if (!texto && tentativa < 1) {
      logger.warn({ tentativa }, "ISA Geradora: Gemini retornou vazio — retentando");
      await new Promise(r => setTimeout(r, 8000));
      return geminiGerar(prompt, tentativa + 1);
    }
    return texto;
  } catch (err) {
    if (tentativa < 1) {
      logger.warn({ err, tentativa }, "ISA Geradora: erro Gemini — retentando em 10s");
      await new Promise(r => setTimeout(r, 10_000));
      return geminiGerar(prompt, tentativa + 1);
    }
    logger.error({ err }, "ISA Geradora: erro Gemini (2ª tentativa)");
    return "";
  }
}

// ── Passada de curadoria editorial (melhora e estrutura o texto gerado) ──────
async function geminiCurar(titulo: string, conteudo: string): Promise<string> {
  if (!GEMINI_KEY || conteudo.length < 500) return conteudo;
  try {
    const prompt = `Você é um editor editorial especializado em materiais educacionais para o vestibular FUVEST.

Receba o seguinte documento gerado por ISA e faça uma CURADORIA EDITORIAL:
1. Corrija erros gramaticais e de concordância
2. Melhore a coesão entre seções
3. Garanta que o documento tenha pelo menos 8 seções bem definidas com títulos ##
4. Adicione uma seção "RESUMO EXECUTIVO" no final com 5-7 bullets dos pontos principais
5. Verifique se há exemplos concretos em cada seção (adicione se faltar)
6. NÃO invente dados — se estiver faltando conteúdo, marque como [EXPANDIR]
7. Mantenha o tom formal mas acessível
8. Retorne o documento COMPLETO (não resuma, preserve todo o conteúdo)

TÍTULO: ${titulo}

DOCUMENTO:
${conteudo.slice(0, 12000)}`;

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(90_000),
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8192, temperature: 0.3 },
        }),
      }
    );
    const data = await resp.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const curado = (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
    if (curado && curado.length > conteudo.length * 0.7) {
      logger.info({ antes: conteudo.length, depois: curado.length }, "ISA Geradora: curadoria aplicada");
      return curado;
    }
    // Se curadoria falhou ou encurtou demais, mantém original
    logger.warn("ISA Geradora: curadoria descartada (texto encurtado demais)");
    return conteudo;
  } catch (err) {
    logger.warn({ err }, "ISA Geradora: falha na curadoria — usando original");
    return conteudo;
  }
}

// ── Gera PDF a partir de texto Markdown ────────────────────────────────────
function gerarPdf(titulo: string, conteudo: string, outputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margins: { top: 72, bottom: 72, left: 72, right: 72 },
      size: "A4",
      info: {
        Title: titulo,
        Author: "ISA — Projeto Aliança Panorama (PAP)",
        Creator: "ISA Biblioteca Geradora v1.0",
        Subject: "Material Educacional PAP",
      },
    });

    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Capa
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0d0b08");
    doc.fillColor("#c8a050").fontSize(28).font("Helvetica-Bold")
      .text("ISA — Projeto Aliança Panorama", { align: "center" })
      .moveDown(0.5);
    doc.fillColor("#888").fontSize(11).font("Helvetica")
      .text("Biblioteca de Conhecimento Original", { align: "center" })
      .moveDown(2);
    doc.fillColor("#e8d8b0").fontSize(20).font("Helvetica-Bold")
      .text(titulo, { align: "center" })
      .moveDown(1.5);
    doc.fillColor("#666").fontSize(10).font("Helvetica")
      .text(`Gerado por ISA em ${new Date().toLocaleDateString("pt-BR", { day:"2-digit", month:"long", year:"numeric" })}`, { align: "center" })
      .moveDown(0.5);
    doc.fillColor("#444").text("Sociedade Tucci · site-st.vercel.app/aliancapanorama", { align: "center" });

    doc.addPage();
    // Reset background for content pages
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#ffffff");

    // Process content
    const lines = conteudo.split("\n");
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.startsWith("```")) { inCodeBlock = !inCodeBlock; continue; }

      if (inCodeBlock) {
        doc.fillColor("#333").fontSize(9).font("Courier")
          .text(line, { lineGap: 1 });
        continue;
      }

      if (line.startsWith("## ")) {
        doc.moveDown(0.8)
          .fillColor("#1a1008").fontSize(16).font("Helvetica-Bold")
          .text(line.replace(/^## /, ""), { underline: false })
          .moveDown(0.3);
      } else if (line.startsWith("### ")) {
        doc.moveDown(0.5)
          .fillColor("#2a1a05").fontSize(13).font("Helvetica-Bold")
          .text(line.replace(/^### /, ""), { underline: false })
          .moveDown(0.2);
      } else if (line.startsWith("#### ")) {
        doc.moveDown(0.3)
          .fillColor("#3a2a10").fontSize(11).font("Helvetica-Bold")
          .text(line.replace(/^#### /, ""), { underline: false })
          .moveDown(0.1);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        doc.fillColor("#222").fontSize(11).font("Helvetica")
          .text("• " + line.replace(/^[-*] /, ""), {
            indent: 16, lineGap: 2,
          });
      } else if (/^\d+\. /.test(line)) {
        doc.fillColor("#222").fontSize(11).font("Helvetica")
          .text(line, { indent: 16, lineGap: 2 });
      } else if (line.startsWith("> ")) {
        doc.fillColor("#555").fontSize(11).font("Helvetica-Oblique")
          .text(line.replace(/^> /, ""), {
            indent: 24, lineGap: 3,
          });
      } else if (line.trim() === "") {
        doc.moveDown(0.4);
      } else if (line.startsWith("**") && line.endsWith("**")) {
        doc.fillColor("#111").fontSize(11).font("Helvetica-Bold")
          .text(line.replace(/\*\*/g, ""), { lineGap: 2 });
      } else {
        // Strip inline bold/italic for simplicity
        const clean = line.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/__([^_]+)__/g, "$1").replace(/_([^_]+)_/g, "$1");
        doc.fillColor("#111").fontSize(11).font("Helvetica")
          .text(clean, { lineGap: 2, align: "justify" });
      }
    }

    // Rodapé última página
    doc.moveDown(2)
      .fillColor("#888").fontSize(9).font("Helvetica")
      .text("Este documento foi gerado por ISA — Inteligência Semiótica Autônoma do Projeto Aliança Panorama (PAP).", { align: "center" })
      .moveDown(0.3)
      .text("O conteúdo é original e baseado em síntese de conhecimento educacional. Uso exclusivo para preparação vestibular.", { align: "center" });

    doc.end();

    stream.on("finish", () => {
      const stats = fs.statSync(outputPath);
      resolve(stats.size);
    });
    stream.on("error", reject);
  });
}

// ── Escolhe tópico: evita repetir o mesmo da última semana ─────────────────
async function escolherTopico(): Promise<typeof TOPICOS[0]> {
  try {
    const ultimos = await db
      .select({ titulo: bibliotecaDocsTable.titulo })
      .from(bibliotecaDocsTable)
      .where(sql`${bibliotecaDocsTable.origem} = 'isa-gerado'`)
      .orderBy(desc(bibliotecaDocsTable.createdAt))
      .limit(TOPICOS.length);
    const usados = new Set(ultimos.map((r) => r.titulo));
    const disponiveis = TOPICOS.filter((t) => !usados.has(t.tema));
    const pool_ = disponiveis.length > 0 ? disponiveis : TOPICOS;
    return pool_[Math.floor(Math.random() * pool_.length)]!;
  } catch {
    return TOPICOS[Math.floor(Math.random() * TOPICOS.length)]!;
  }
}

// ── Envio por email ─────────────────────────────────────────────────────────
async function enviarEmail(titulo: string, resumo: string, pdfPath: string): Promise<void> {
  if (!GMAIL_PASS) return;
  try {
    const nodemailer = await import("nodemailer");
    const t = nodemailer.createTransport({ service: "gmail", auth: { user: GMAIL, pass: GMAIL_PASS } });
    await t.sendMail({
      from: GMAIL,
      to: LUDD,
      subject: `[ISA Biblioteca] ${titulo}`,
      text: `ISA gerou um novo documento para a Biblioteca PAP:\n\n📚 ${titulo}\n\n${resumo.slice(0, 600)}...\n\n— ISA · ${new Date().toISOString()}`,
      attachments: [{ filename: path.basename(pdfPath), path: pdfPath }],
    });
  } catch (err) {
    logger.warn({ err }, "ISA Geradora: falha ao enviar email com PDF");
  }
}

// ── Ciclo principal ─────────────────────────────────────────────────────────
export async function runBibliotecaGeradora(): Promise<{ titulo: string; palavras: number; pdfPath: string; ok: boolean }> {
  await bootstrapColumn();
  ensureDir();

  const topico = await escolherTopico();
  logger.info({ tema: topico.tema }, "ISA Geradora: iniciando documento");

  const prompt = `${topico.instrucao}

O documento deve ter MÍNIMO de 4000 palavras (o que equivale a 10 páginas A4).
Comece com uma INTRODUÇÃO (por que este tema é relevante para a FUVEST e para a formação do estudante).
Termine com uma CONCLUSÃO e uma seção RESUMO EXECUTIVO (pontos principais em bullets).
Inclua, quando relevante, exemplos de questões no estilo FUVEST com análise detalhada.
Título do documento: ${topico.tema}`;

  const conteudoBruto = await geminiGerar(prompt);
  if (!conteudoBruto || conteudoBruto.length < 1000) {
    logger.warn("ISA Geradora: conteúdo muito curto ou vazio após 2 tentativas");
    return { titulo: topico.tema, palavras: 0, pdfPath: "", ok: false };
  }

  // Passada de curadoria editorial (melhora estrutura e corrige antes do PDF)
  const conteudo = await geminiCurar(topico.tema, conteudoBruto);
  const palavras = conteudo.split(/\s+/).length;
  const slug     = topico.tema.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 60);
  const filename = `${Date.now()}-${slug}.pdf`;
  const pdfPath  = path.join(GER_DIR, filename);

  const tamanhoBytes = await gerarPdf(topico.tema, conteudo, pdfPath).catch((err) => {
    logger.error({ err }, "ISA Geradora: falha ao gerar PDF");
    return 0;
  });

  const resumo = conteudo.slice(0, 800);

  // Salva no banco
  await db.insert(bibliotecaDocsTable).values({
    titulo:       topico.tema,
    url:          null,
    localPath:    pdfPath,
    tipo:         "pdf",
    origem:       "isa-gerado",
    tamanhoBytes: tamanhoBytes,
    resumo:       resumo,
    tags:         topico.tags,
    disponivel:   true,
  });
  // Salva content_text via SQL direto (coluna adicionada via ALTER TABLE no bootstrap)
  await pool.query(
    `UPDATE biblioteca_docs SET content_text = $1, gerado_por = 'isa'
     WHERE id = (SELECT id FROM biblioteca_docs WHERE titulo = $2 ORDER BY id DESC LIMIT 1)`,
    [conteudo, topico.tema],
  ).catch(() => { /* coluna pode não existir ainda na primeira execução */ });

  // Memória ISA
  await db.insert(isaMemoryTable).values({
    userId:    null,
    userEmail: null,
    context:   "biblioteca",
    role:      "isa",
    content:   `📚 Documento gerado: "${topico.tema}" — ${palavras} palavras → ${filename}`,
    location:  "/biblioteca",
    sessionId: `ger-${Date.now()}`,
    metadata:  { titulo: topico.tema, palavras, tags: topico.tags },
  });

  // Email com PDF em anexo
  await enviarEmail(topico.tema, resumo, pdfPath);

  logger.info({ titulo: topico.tema, palavras, tamanhoBytes }, "ISA Geradora: documento concluído");
  return { titulo: topico.tema, palavras, pdfPath, ok: true };
}

// ── Re-hidratação ao reiniciar Railway (recria PDF do content_text se perdi o arquivo) ──
export async function rehydratarGerados(): Promise<void> {
  try {
    ensureDir();
    const docs = await db.execute(sql`
      SELECT id, titulo, local_path, content_text
      FROM biblioteca_docs
      WHERE origem = 'isa-gerado'
        AND content_text IS NOT NULL
        AND local_path IS NOT NULL
    `);
    let rehydrated = 0;
    for (const row of docs.rows as { id: number; titulo: string; local_path: string; content_text: string }[]) {
      if (!row.local_path || fs.existsSync(row.local_path)) continue;
      try {
        const size = await gerarPdf(row.titulo, row.content_text, row.local_path);
        await pool.query("UPDATE biblioteca_docs SET tamanho_bytes = $1 WHERE id = $2", [size, row.id]);
        rehydrated++;
      } catch {
        // silencioso
      }
    }
    if (rehydrated > 0) logger.info({ rehydrated }, "ISA Geradora: re-hidratou PDFs");
  } catch {
    // tabela pode não existir ainda
  }
}
