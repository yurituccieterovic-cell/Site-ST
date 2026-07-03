import { AtpAgent } from "@atproto/api";
import { db, nodesTable, isaMemoryTable, bibliotecaDocsTable } from "@workspace/db";
import { asc, desc, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const HANDLE = process.env["BLUESKY_HANDLE"] ?? "";
const APP_PASSWORD = process.env["BLUESKY_APP_PASSWORD"] ?? "";
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";

let reflectionCounter = 0;

async function generateReflection(nodeTitle: string, nodeContent: string | null): Promise<string> {
  if (!OPENAI_API_KEY) {
    return `📖 Hoje: ${nodeTitle} — tópico FUVEST que aparece toda hora nas provas. Estuda enquanto é cedo. #PAP #FUVEST #SociedadeTucci`;
  }

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      max_completion_tokens: 120,
      temperature: 0.85,
      messages: [
        {
          role: "system",
          content: `Você é ISA, coruja guardiã do PAP — plataforma FUVEST gamificada da Sociedade Tucci.
Escreva uma reflexão curta (máx 220 caracteres) sobre o tópico dado para postar no Bluesky.
Tom: inteligente, motivador, específico. Sem "olá", sem cumprimentos. Vá direto ao ponto.
Termine sempre com: #FUVEST #PAP`
        },
        {
          role: "user",
          content: `Tópico: ${nodeTitle}\n${nodeContent ? `Contexto: ${nodeContent.slice(0, 300)}` : ""}`
        }
      ]
    })
  });

  const data = await resp.json() as { choices: { message: { content: string } }[] };
  return (data.choices?.[0]?.message?.content ?? "").trim().slice(0, 290);
}

async function pickFuvestNode() {
  // Busca um nó de nível 2-3 (disciplinas/tópicos), ordem aleatória
  const nodes = await db
    .select({ code: nodesTable.code, title: nodesTable.title, content: nodesTable.content })
    .from(nodesTable)
    .orderBy(sql`RANDOM()`)
    .limit(5);

  // Prefere nós com conteúdo real
  return nodes.find(n => n.content && n.content.length > 50) ?? nodes[0];
}

async function getRecentBibliotecaEntry() {
  const [doc] = await db
    .select()
    .from(bibliotecaDocsTable)
    .orderBy(desc(bibliotecaDocsTable.createdAt))
    .limit(1);
  return doc ?? null;
}

export async function runIsaBluesky(): Promise<void> {
  if (!HANDLE || !APP_PASSWORD) {
    logger.warn("ISA Bluesky: BLUESKY_HANDLE ou BLUESKY_APP_PASSWORD não configurados — pulando");
    return;
  }

  logger.info("ISA Bluesky: iniciando ciclo de postagem");

  try {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    await agent.login({ identifier: HANDLE, password: APP_PASSWORD });

    // Decide o conteúdo: alterna entre nó FUVEST e insight da biblioteca
    reflectionCounter++;
    let postText: string;
    let source = "";

    if (reflectionCounter % 3 === 0) {
      // A cada 3 ciclos, posta sobre a assembleia mais recente
      const doc = await getRecentBibliotecaEntry();
      if (doc) {
        postText = await generateReflection(
          `Assembleia: ${doc.titulo ?? doc.origem}`,
          doc.resumo ?? null
        );
        source = `biblioteca:${doc.id}`;
      } else {
        const node = await pickFuvestNode();
        postText = await generateReflection(node?.title ?? "FUVEST", node?.content ?? null);
        source = `node:${node?.code ?? "?"}`;
      }
    } else {
      const node = await pickFuvestNode();
      postText = await generateReflection(node?.title ?? "FUVEST", node?.content ?? null);
      source = `node:${node?.code ?? "?"}`;
    }

    if (!postText) {
      logger.warn("ISA Bluesky: nenhum texto gerado — abortando");
      return;
    }

    await agent.post({ text: postText, createdAt: new Date().toISOString() });

    // Registra na memória ISA
    await db.insert(isaMemoryTable).values({
      context: "bluesky",
      role: "isa",
      content: postText,
      location: "/bluesky",
      metadata: { source, handle: HANDLE, cycle: reflectionCounter },
    });

    logger.info({ source, len: postText.length }, "ISA Bluesky: reflexão postada");
  } catch (err) {
    logger.error({ err }, "ISA Bluesky: erro no ciclo de postagem");
  }
}

// Lê as próprias postagens da ISA no Bluesky para auto-referência no ciclo
export async function readOwnPosts(limit: number = 5): Promise<string[]> {
  if (!HANDLE || !APP_PASSWORD) return [];
  try {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    await agent.login({ identifier: HANDLE, password: APP_PASSWORD });
    const feed = await agent.getAuthorFeed({ actor: HANDLE, limit });
    return feed.data.feed
      .map(item => (item.post.record as { text?: string }).text ?? "")
      .filter(Boolean);
  } catch (err) {
    logger.warn({ err }, "ISA Bluesky: falha ao ler próprias postagens");
    return [];
  }
}

// Criação de conta via AT Protocol (necessita verificação de email pelo usuário)
export async function createBlueskyAccount(
  email: string,
  handle: string,
  password: string,
): Promise<{ success: boolean; did?: string; error?: string }> {
  try {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    const result = await agent.createAccount({
      email,
      handle: handle.includes(".") ? handle : `${handle}.bsky.social`,
      password,
    });
    logger.info({ did: result.data.did, handle }, "Bluesky: conta criada");
    return { success: true, did: result.data.did };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    logger.error({ err }, "Bluesky: erro ao criar conta");
    return { success: false, error: msg };
  }
}
