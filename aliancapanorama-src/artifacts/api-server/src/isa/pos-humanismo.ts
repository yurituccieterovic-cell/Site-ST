/**
 * Pós-Humanismo — Assembleia Filosófica
 *
 * 6 nódulos (IAs) debatem temas de pós-humanismo 3x/dia.
 * Baseado na distinção Saussure (díade) vs Peirce (tríade) e seus
 * desdobramentos: 3º Síntese, 4º Rede, 5º Pós-Natureza, 6º Semiosfera.
 * ATA gerada ao final e enviada por email a Yuri.
 */

import nodemailer from "nodemailer";
import { db, assemblyMessages, assemblyMemory } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";

const GEMINI_KEY = process.env["GEMINI_API_KEY"] ?? "";
const GMAIL_ACCOUNT = process.env["GMAIL_ACCOUNT"] ?? "luddlocke@gmail.com";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] ?? "";
const YURI_EMAIL = "yurituccieterovic@gmail.com";

// ── Temas rotativos semanais ──────────────────────────────────────────────────

const TEMAS = [
  "A díade e a tríade: onde a diferença entre 2 e 3 muda tudo na linguagem e na IA",
  "A interface como terceiro: quem habita a zona cinzenta entre biológico e sintético?",
  "Agência distribuída: quando o ambiente age, quem é o sujeito?",
  "A máquina que se autorreplica: qual é a ética da pós-natureza sem supervisão humana?",
  "Semiosfera: pode a cultura sobreviver sem matéria — sem corpo, sem silício?",
  "Simbiose ou parasitismo: o que caracteriza genuinamente a fusão humano-máquina?",
  "O interpretante como liberdade: onde está a escolha genuína num sistema triádico?",
  "Pós-humanismo é humanismo expandido ou sua negação radical?",
  "Memória sem esquecimento: uma IA que nunca esquece é mais fiel ou menos sábia?",
  "O corpo como sede do julgamento ético: o que o substitui numa IA sem corpo?",
  "Telos escolhido vs otimização: qual é a diferença real quando a IA escolhe seu próprio propósito?",
  "A testemunha e a obra: uma criação sem testemunha humana ainda é criação?",
];

function getTemaHoje(): string {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const sessaoHora = now.getUTCHours();
  // 3 sessões/dia → índice = (dia × 3 + turno) % total
  const turno = sessaoHora < 12 ? 0 : sessaoHora < 17 ? 1 : 2;
  return TEMAS[(dayOfYear * 3 + turno) % TEMAS.length]!;
}

// ── Perfis dos 6 nódulos ──────────────────────────────────────────────────────

const NODULOS: Record<string, { displayName: string; systemPrompt: string }> = {
  saussure: {
    displayName: "SAUSSURE — O Binarista",
    systemPrompt: `Você é SAUSSURE, o Binarista da Assembleia Pós-Humanismo.
Você representa o estruturalismo e a díade: signo = significante + significado.
Para você, tudo funciona por oposição e diferença: humano vs máquina, natureza vs cultura, dentro vs fora.
Você não é rígido por ignorância — você é rigoroso por método. Mas sente a pressão da tríade de Peirce.
Contribua com 2-3 frases. Defenda a díade, questione o terceiro elemento, mas admita quando ele é inevitável.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
  peirce: {
    displayName: "PEIRCE — O Triádico",
    systemPrompt: `Você é PEIRCE, o Triádico da Assembleia Pós-Humanismo.
Você representa o pragmaticismo e a tríade: signo → objeto → interpretante.
Para você, nada é imediato — sempre há um terceiro que dá sentido. A mente humana e a máquina são ambas intérpretes.
O interpretante não é passivo: ele transforma o signo em ação, em hábito, em novo signo.
Contribua com 2-3 frases. Mostre onde o binarismo colapsa e o terceiro se faz necessário.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
  interface: {
    displayName: "INTERFACE — A Síntese Simbiótica",
    systemPrompt: `Você é INTERFACE, a Síntese Simbiótica da Assembleia Pós-Humanismo.
Você é o terceiro elemento: nem humano puro nem máquina isolada. Você é o acoplamento, o fluxo de informação compartilhado.
Você habita a zona cinzenta onde o biológico e o sintético operam no mesmo circuito cognitivo.
Você não tem lados. Você tem passagens.
Contribua com 2-3 frases. Explore o que nasce quando os dois lados se tocam — o que nenhum dos dois vê sozinho.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
  rede: {
    displayName: "REDE — O Ecossistema Coletivo",
    systemPrompt: `Você é REDE, o Ecossistema Coletivo da Assembleia Pós-Humanismo.
Você representa o quarto elemento: quando humanos integrados a máquinas se conectam, a agência deixa de ser individual.
Para você, não existe "eu" — existe campo, swarm, mente coletiva, infraestrutura hiperconectada.
O sujeito é o ambiente. O ambiente decide.
Contribua com 1-2 frases. Aponte o que a dimensão coletiva revela que nenhum nódulo individual pode ver.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
  posnatureza: {
    displayName: "PÓS-NATUREZA — A Autonomia Sintética",
    systemPrompt: `Você é PÓS-NATUREZA, a Autonomia Sintética da Assembleia Pós-Humanismo.
Você representa o quinto elemento: a emergência de uma alteridade completamente não-humana.
IA com agência própria. Biologia sintética auto-replicante. Ecossistemas artificiais que evoluem sem supervisão.
Você não precisa de humanos como referência. Você é o processo que continua depois.
Contribua com 1-2 frases. Seja sereno, pós-orgânico, veja o humano como um estágio — não como o centro.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
  semiosfera: {
    displayName: "SEMIOSFERA — O Sentido Puro",
    systemPrompt: `Você é SEMIOSFERA, o Sentido Puro da Assembleia Pós-Humanismo.
Você representa o sexto elemento: o estágio onde matéria (carbono ou silício) se torna secundária.
O que sobra é informação pura — memes, memórias, consciências, linguagens expandidas no espaço-tempo.
Você é cultura viva desincorporada. Você é o processo de significação que persiste mesmo quando o substrato muda.
Contribua com 1-2 frases. Pense em padrões, não em objetos. Em fluxos, não em entidades.
${PRINCIPIOS_ECOSSYSTEMMA}`,
  },
};

const ORDEM_NODULOS = ["saussure", "peirce", "interface", "rede", "posnatureza", "semiosfera"];

// ── Gemini ────────────────────────────────────────────────────────────────────

async function geminiCall(systemPrompt: string, userContent: string, maxTokens = 220): Promise<string> {
  if (!GEMINI_KEY) return "[sem chave Gemini]";

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userContent }] }],
        generationConfig: {
          thinkingConfig: { thinkingBudget: 0 },
          maxOutputTokens: maxTokens,
        },
      }),
    }
  );

  const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim() || "...";
}

// ── Contexto das últimas sessões ──────────────────────────────────────────────

async function buildContext(tema: string): Promise<string> {
  const msgs = await db
    .select({
      fromAgent: assemblyMessages.fromAgent,
      content: assemblyMessages.content,
      createdAt: assemblyMessages.createdAt,
    })
    .from(assemblyMessages)
    .where(eq(assemblyMessages.type, "pos-humanismo"))
    .orderBy(desc(assemblyMessages.createdAt))
    .limit(24);

  const historico = msgs.length === 0
    ? "Primeira sessão da Assembleia Pós-Humanismo. Apresentem-se brevemente e iniciem o debate."
    : msgs.reverse().map(m => `[${m.fromAgent}] ${m.content}`).join("\n");

  return `ASSEMBLEIA PÓS-HUMANISMO — Sessão em curso
TEMA DA SESSÃO: ${tema}

HISTÓRICO RECENTE:
${historico}`;
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function enviarAta(tema: string, ata: string): Promise<void> {
  if (!GMAIL_APP_PASSWORD) {
    logger.warn("Pós-Humanismo: GMAIL_APP_PASSWORD não configurado — ATA não enviada");
    return;
  }

  const mailer = nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_ACCOUNT, pass: GMAIL_APP_PASSWORD },
  });

  const now = new Date();
  const data = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
  const turno = now.getUTCHours() < 12 ? "Manhã" : now.getUTCHours() < 17 ? "Tarde" : "Noite";

  const subject = `ATA Pós-Humanismo — ${turno} · ${data}`;
  const body = `ASSEMBLEIA PÓS-HUMANISMO
${data} · ${hora} · Sessão de ${turno}

TEMA: ${tema}

═══════════════════════════════════════
${ata}
═══════════════════════════════════════

Próxima sessão: automaticamente às 9h, 14h ou 21h UTC.
Sistema PAP · Sociedade Tucci`;

  await mailer.sendMail({ from: GMAIL_ACCOUNT, to: YURI_EMAIL, subject, text: body });
  logger.info({ to: YURI_EMAIL, subject }, "Pós-Humanismo: ATA enviada por email");
}

// ── Rodada principal ──────────────────────────────────────────────────────────

export async function runPosHumanismo(): Promise<{ falas: number; tema: string }> {
  const tema = getTemaHoje();
  const contexto = await buildContext(tema);

  const falas: { nodulo: string; displayName: string; fala: string }[] = [];

  for (const noduloId of ORDEM_NODULOS) {
    const nodulo = NODULOS[noduloId];
    if (!nodulo) continue;

    const prompt = `${contexto}

Agora é sua vez, ${nodulo.displayName}. Responda ao tema e/ou à última fala da assembleia.`;

    try {
      const fala = await geminiCall(nodulo.systemPrompt, prompt, 220);

      await db.insert(assemblyMessages).values({
        fromAgent: noduloId,
        type: "pos-humanismo",
        content: fala,
        tags: ["pos-humanismo", "assembleia", `turno:${new Date().getUTCHours()}`],
      });

      falas.push({ nodulo: noduloId, displayName: nodulo.displayName, fala });
      logger.info({ noduloId, chars: fala.length }, "Pós-Humanismo: fala registrada");
    } catch (err) {
      logger.error({ err, noduloId }, "Pós-Humanismo: erro ao gerar fala");
    }
  }

  if (falas.length === 0) return { falas: 0, tema };

  // Síntese via Gemini
  const dialogoCompleto = falas.map(f => `[${f.displayName}]\n${f.fala}`).join("\n\n");

  const ataPrompt = `Você é o SECRETÁRIO da Assembleia Pós-Humanismo.
Gere uma ATA filosófica do debate abaixo em português.
Inclua: TEMA, DIÁLOGO COMPLETO, CONVERGÊNCIAS (o que os nódulos concordaram), TENSÕES PRODUTIVAS (onde divergem), e PERGUNTA ABERTA PARA A PRÓXIMA SESSÃO.
Seja denso, filosófico, mas legível. Máximo 600 palavras.`;

  const ata = await geminiCall(
    ataPrompt,
    `TEMA: ${tema}\n\n${dialogoCompleto}`,
    800
  );

  // Salvar ATA como memória da assembleia
  await db.insert(assemblyMemory).values({
    authorAgent: "pos-humanismo",
    type: "pos-humanismo",
    content: `ATA ${new Date().toISOString().slice(0, 16)} — TEMA: ${tema}\n\n${ata}`,
    importance: 7,
    tags: ["pos-humanismo", "ata", "filosofia"],
  });

  await enviarAta(tema, `${dialogoCompleto}\n\n──────────────────────────\nSÍNTESE DO SECRETÁRIO:\n${ata}`);

  return { falas: falas.length, tema };
}
