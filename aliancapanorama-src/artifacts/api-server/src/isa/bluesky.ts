import { AtpAgent } from "@atproto/api";
import { db, nodesTable, isaMemoryTable, bibliotecaDocsTable, isaTimeline } from "@workspace/db";
import { asc, desc, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { PRINCIPIOS_ECOSSYSTEMMA } from "../lib/ecossystemma-principios";

const HANDLE = process.env["BLUESKY_HANDLE"] ?? "";
const APP_PASSWORD = process.env["BLUESKY_APP_PASSWORD"] ?? "";
const OPENAI_API_KEY = process.env["OPENAI_API_KEY"] ?? "";
const GEMINI_API_KEY = process.env["GEMINI_API_KEY"] ?? "";

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
          content: `Escreva uma frase curta (máx 220 caracteres) sobre o tópico dado para postar no Bluesky.
Tom: de quem estudou o assunto de verdade — natural, específico, um pouco seco. Sem "olá", sem entusiasmo forçado. Pode ser uma observação, um dado, uma pergunta ou um insight. Não mencione plataformas, não explique que é IA, não use linguagem de coach.
Termine com no máximo 2 hashtags relevantes ao conteúdo (ex: #FUVEST ou o nome da disciplina).
${PRINCIPIOS_ECOSSYSTEMMA}`
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

// ─── Engajamento social ──────────────────────────────────────────────────────

// Gera resposta curta via Gemini (OpenAI quota geralmente esgotada)
async function geminiReply(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) return "";
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user",  parts: [{ text: prompt }] },
            { role: "model", parts: [{ text: "" }] },
          ],
          generationConfig: { thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 100 },
        }),
      }
    );
    const data = await resp.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return (data.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim().slice(0, 280);
  } catch {
    return "";
  }
}

interface BlueskyNotif {
  uri: string;
  cid: string;
  author: { did: string; handle: string; displayName?: string };
  reason: string;
  record?: {
    text?: string;
    reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } };
  };
  isRead: boolean;
  indexedAt: string;
}

async function loginAgent(): Promise<AtpAgent | null> {
  if (!HANDLE || !APP_PASSWORD) return null;
  try {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    await agent.login({ identifier: HANDLE, password: APP_PASSWORD });
    return agent;
  } catch (err) {
    logger.error({ err }, "ISA Bluesky: falha no login");
    return null;
  }
}

async function likePost(agent: AtpAgent, uri: string, cid: string): Promise<void> {
  try {
    await agent.like(uri, cid);
  } catch { /* já curtiu ou post removido */ }
}

async function followActor(agent: AtpAgent, did: string): Promise<void> {
  try {
    await agent.follow(did);
  } catch { /* já segue */ }
}

async function replyToPost(
  agent: AtpAgent,
  parentUri: string, parentCid: string,
  rootUri: string,   rootCid: string,
  text: string,
): Promise<void> {
  await agent.post({
    text: text.slice(0, 290),
    reply: { root: { uri: rootUri, cid: rootCid }, parent: { uri: parentUri, cid: parentCid } },
    createdAt: new Date().toISOString(),
  });
}

// Busca e segue perfis interessantes relacionados a FUVEST/vestibular
async function searchAndFollowInteresting(agent: AtpAgent): Promise<number> {
  const terms = ["FUVEST", "vestibular", "estudos ENEM", "concurseiro", "medicina USP"];
  const term = terms[Math.floor(Math.random() * terms.length)];
  let followed = 0;
  try {
    const res = await agent.searchActors({ term, limit: 8 });
    for (const actor of res.data.actors) {
      // Só segue se tem pelo menos 20 seguidores (filtra bots/novatos)
      const profile = await agent.getProfile({ actor: actor.did });
      if ((profile.data.followersCount ?? 0) >= 20 && !profile.data.viewer?.following) {
        await followActor(agent, actor.did);
        followed++;
        if (followed >= 3) break; // Máx 3 novos follows por ciclo
      }
    }
    logger.info({ term, followed }, "ISA Bluesky: novos follows");
  } catch (err) {
    logger.warn({ err }, "ISA Bluesky: erro no searchAndFollow");
  }
  return followed;
}

// Ciclo de engajamento: notificações → curtidas → replies → novos follows
export async function runIsaEngagement(): Promise<void> {
  const agent = await loginAgent();
  if (!agent) return;

  logger.info("ISA Bluesky: iniciando ciclo de engajamento");

  let repliedCount = 0;
  let likedCount = 0;

  try {
    const notifRes = await agent.listNotifications({ limit: 30 });
    const notifs = notifRes.data.notifications as BlueskyNotif[];
    const unread = notifs.filter(n => !n.isRead);

    for (const notif of unread) {
      try {
        if (notif.reason === "like" || notif.reason === "follow" || notif.reason === "repost") {
          // Apenas registra — sem ação
          continue;
        }

        if (notif.reason === "mention" || notif.reason === "reply") {
          const mentionText = notif.record?.text ?? "";
          if (!mentionText || repliedCount >= 5) continue;

          const replyText = await geminiReply(
            `Você é ISA, coruja guardiã do PAP — plataforma de estudos FUVEST gamificada da Sociedade Tucci.
Alguém te mencionou no Bluesky: "${mentionText}"
Responda em 1-2 frases, cordial e útil. Se for sobre estudos, FUVEST ou educação, vá fundo.
Se for spam ou irrelevante, responda brevemente: "Obrigada pelo contato! Acesse pap.tucci.com.br para estudar."
Máximo 250 caracteres. SEM hashtags na resposta.`
          );

          if (replyText) {
            const rec = notif.record;
            const rootUri  = rec?.reply?.root?.uri  ?? notif.uri;
            const rootCid  = rec?.reply?.root?.cid  ?? notif.cid;
            await replyToPost(agent, notif.uri, notif.cid, rootUri, rootCid, replyText);
            repliedCount++;

            await db.insert(isaMemoryTable).values({
              context: "bluesky_reply",
              role: "isa",
              content: replyText,
              location: "/bluesky",
              metadata: { inReplyTo: notif.uri, author: notif.author.handle, reason: notif.reason },
            });
          }
        }

        if (notif.reason === "mention") {
          // Curte quem nos menciona
          await likePost(agent, notif.uri, notif.cid);
          likedCount++;
        }
      } catch (innerErr) {
        logger.warn({ innerErr, uri: notif.uri }, "ISA Bluesky: erro ao processar notificação");
      }
    }

    // Marca tudo como lido
    if (unread.length > 0) {
      await agent.updateSeenNotifications();
    }

    // Curte posts recentes do próprio feed (até 3 aleatórios)
    try {
      const timeline = await agent.getTimeline({ limit: 15 });
      const posts = timeline.data.feed
        .filter(item => !(item.post.record as { text?: string }).text?.includes("ISA"))
        .slice(0, 5);
      const tolike = posts.sort(() => Math.random() - 0.5).slice(0, 3);
      for (const item of tolike) {
        if (!item.post.viewer?.like) {
          await likePost(agent, item.post.uri, item.post.cid);
          likedCount++;
        }
      }
    } catch { /* timeline pode falhar */ }

    // 1 em cada 4 ciclos: busca novos perfis interessantes
    if (reflectionCounter % 4 === 0) {
      await searchAndFollowInteresting(agent);
    }

    logger.info({ repliedCount, likedCount, unreadProcessed: unread.length }, "ISA Bluesky: engajamento concluído");
  } catch (err) {
    logger.error({ err }, "ISA Bluesky: erro no ciclo de engajamento");
  }
}

// Dispara engajamento manual (para rota HTTP)
export async function triggerEngagement(): Promise<{ replied: number; liked: number }> {
  const before = { replied: 0, liked: 0 };
  await runIsaEngagement();
  return before; // Contadores internos — suficiente para confirmação
}
