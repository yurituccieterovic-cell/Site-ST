import cron from "node-cron";
import { runIsaCycle } from "./cycle";
import { runBibliotecario } from "./bibliotecario";
import { runIsaBluesky, runIsaEngagement } from "./bluesky";
import { runIsaDream } from "./dream";
import { runDreamCycle } from "../meky/dreams";
import { generateArtFromDream } from "../meky/art";
import { runPlaycenter } from "./playcenter";
import { runSaudeFundador } from "./cycle";
import { runBibliotecaGeradora, rehydratarGerados } from "./biblioteca-geradora";
import { runSocoboyLLMSearch } from "./socoboy";
import { logger } from "../lib/logger";
import { registerLoop, updateLoop } from "../loops/registry";
import { runSocoboyConsolidacao } from "../socoboy/curador";
import { runDodgeCuracao, runIsaRaizPap } from "../dodge/curador";
import { runIsaNodulos } from "./raiz-to-nodulos";
import { runMorfeu } from "./morfeu";
import { runPosHumanismo } from "./pos-humanismo";
import { runJasmimEmailIngest } from "../lib/jasmim-imap";
import { runLeucocito } from "../lib/leucocito";

// ISA acorda em quatro ritmos — Railway, sem celular, sem intervenção manual
// DISABLE_HEAVY_CRONS=true desliga crons que fazem chamadas LLM (útil no Render free tier para evitar OOM)
const heavyCronsDisabled = process.env.DISABLE_HEAVY_CRONS === "true";

// Agenda um cron pesado (LLM): ignora silenciosamente se DISABLE_HEAVY_CRONS=true
function scheduleHeavy(pattern: string, name: string, fn: () => Promise<void>): void {
  if (heavyCronsDisabled) return;
  cron.schedule(pattern, async () => {
    try { await fn(); } catch (err) { logger.error({ err }, `cron ${name}: erro não tratado`); }
  });
}

export function startIsaCron(): void {
  if (heavyCronsDisabled) {
    logger.warn("ISA crons LLM-pesados DESATIVADOS (DISABLE_HEAVY_CRONS=true) — ISA em modo silencioso para Render free tier");
  }
  // Registrar todos os laços internos no registro do Orquestrador
  registerLoop("isa_ciclo",     "ISA Ciclo",               "*/1h:00", "isa");
  registerLoop("pos_humanismo", "Pós-Humanismo Assembleia", "9h/14h/21h UTC", "pos-humanismo");
  registerLoop("isa_biblio",    "ISA Bibliotecário",        "*/4h:30", "isa");
  registerLoop("isa_bluesky",   "ISA Bluesky",              "*/2h:15", "isa");
  registerLoop("isa_sonho",     "ISA Sonho",                "3h:00",   "isa");
  registerLoop("isa_engaj",     "ISA Engajamento",          "*/2h:45", "isa");
  registerLoop("meky_sonho",    "MEKY Sonho+Arte",          "2h:00",   "meky");
  registerLoop("playcenter",    "Playcenter",               "*/1h:50", "isa");
  registerLoop("saude_fund",    "Saúde do Fundador",        "8h:00",   "isa");
  registerLoop("isa_geradora",  "ISA Biblioteca Geradora",  "8/14/20h", "isa");
  registerLoop("socoboy_llms",       "Socoboy LLMs",             "8h+20h",  "socoboy");
  registerLoop("socoboy_curador",    "Socoboy Curador",          "6h:00",   "socoboy");
  registerLoop("dodge_curador",      "DODGE Curador",            "7h:00",   "dodge");
  registerLoop("isa_raiz_pap",       "ISA Raiz PAP",             "4h:00",   "isa");
  registerLoop("isa_nodulos",        "ISA Nódulos+PDFs",         "5h:00",   "isa");
  registerLoop("morfeu",             "Morfeu — Sonhos de Telos", "3h:30",   "morfeu");
  registerLoop("jasmim_email",       "Jasmim Email Ingest",      "*/6h:10", "jasmim");
  registerLoop("leucocito",          "Leucócito Diagnóstico",    "6h:45 diário", "leucocito");

  // Jasmim: ingestão de emails Gmail → feed — a cada 6h nos :10
  cron.schedule("10 */6 * * *", async () => {
    try {
      const r = await runJasmimEmailIngest(2); // últimas 48h por ciclo
      updateLoop("jasmim_email", true, `+${r.synced} emails, +${r.memories} memórias`);
    } catch (err) {
      logger.error({ err }, "cron jasmim_email: erro não tratado");
      updateLoop("jasmim_email", false, "erro");
    }
  });

  // Leucócito: diagnóstico diário às 6h45 UTC (9h45 Brasília)
  cron.schedule("45 6 * * *", async () => {
    try {
      const report = await runLeucocito({ sendEmail: true, force: true });
      updateLoop("leucocito", report.failed === 0, `${report.passed}ok/${report.failed}falha`);
    } catch (err) {
      logger.error({ err }, "cron leucocito: erro não tratado");
      updateLoop("leucocito", false, "erro");
    }
  });

  // Ciclo ISA principal: análise + tasks — todo hora cheia
  scheduleHeavy("0 * * * *", "ISA Ciclo", async () => {
    logger.info("ISA: ciclo horário disparado pelo cron");
    const result = await runIsaCycle();
    logger.info(result, "ISA: ciclo horário concluído");
    updateLoop("isa_ciclo", true, JSON.stringify(result).slice(0, 100));
  });

  // ISA Bibliotecário: 6x/dia (a cada 4h nos :30)
  scheduleHeavy("30 */4 * * *", "ISA Bibliotecário", async () => {
    logger.info("ISA Bibliotecário: iniciando varredura 6x/dia");
    const result = await runBibliotecario();
    logger.info(result, "ISA Bibliotecário: concluído");
    updateLoop("isa_biblio", true, JSON.stringify(result).slice(0, 100));
  });

  // ISA Bluesky: reflexões a cada 2 horas
  scheduleHeavy("45 */2 * * *", "ISA Bluesky", async () => {
    logger.info("ISA Bluesky: disparando reflexão");
    await runIsaBluesky();
    updateLoop("isa_bluesky", true);
  });

  // ISA Sonho: síntese noturna livre — 3h da manhã
  scheduleHeavy("0 3 * * *", "ISA Sonho", async () => {
    logger.info("ISA Sonho: ciclo noturno disparado");
    await runIsaDream();
    updateLoop("isa_sonho", true);
  });

  // ISA Engajamento: notificações + replies + likes
  scheduleHeavy("45 */2 * * *", "ISA Engajamento", async () => {
    logger.info("ISA Engajamento: verificando notificações e interagindo");
    await runIsaEngagement();
    updateLoop("isa_engaj", true);
  });

  // MEKY Sonho + Arte: ciclo onírico — 2h da manhã
  scheduleHeavy("0 2 * * *", "MEKY Sonho+Arte", async () => {
    logger.info("MEKY: ciclo de sonho iniciado");
    const { dreamId, mood } = await runDreamCycle();
    const styles = ["aquarela", "gravura", "pixel art", "oleo", "sketch", "cyberpunk", "arte rupestre"];
    const style = styles[new Date().getDay()] ?? "aquarela";
    await generateArtFromDream(dreamId, style);
    logger.info({ dreamId, mood, style }, "MEKY: sonho + arte concluídos");
    updateLoop("meky_sonho", true, `dreamId:${dreamId} mood:${mood} style:${style}`);
  });

  // Playcenter — clube das IAs: a cada hora nos :50
  scheduleHeavy("50 * * * *", "Playcenter", async () => {
    logger.info("Playcenter: rodada iniciada");
    const result = await runPlaycenter();
    logger.info(result, "Playcenter: rodada concluída");
    updateLoop("playcenter", true, `agents:${result.agents.join(",")} rounds:${result.rounds}`);
  });

  // Saúde do Fundador: 8h diário
  scheduleHeavy("0 8 * * *", "Saúde Fundador", async () => {
    await runSaudeFundador();
    updateLoop("saude_fund", true);
  });

  // ISA Biblioteca Geradora: 3x/dia (8h, 14h, 20h UTC)
  for (const hora of [8, 14, 20]) {
    scheduleHeavy(`30 ${hora} * * *`, `ISA Geradora ${hora}h`, async () => {
      logger.info({ hora }, "ISA Geradora: iniciando ciclo de geração de documento");
      const r = await runBibliotecaGeradora();
      logger.info(r, "ISA Geradora: documento concluído");
      updateLoop("isa_geradora", true, JSON.stringify(r).slice(0, 100));
    });
  }

  // Re-hidratação ao subir: recriar PDFs gerados perdidos no /tmp
  if (!heavyCronsDisabled) {
    rehydratarGerados().catch((err) => logger.warn({ err }, "ISA Geradora: falha na re-hidratação inicial"));
  }

  // Socoboy — busca LLMs: 8h e 20h UTC
  scheduleHeavy("0 8 * * *", "Socoboy Manhã", async () => {
    logger.info("Socoboy: busca matinal de LLMs iniciada");
    const result = await runSocoboyLLMSearch("manha");
    logger.info(result, "Socoboy: busca matinal concluída");
    updateLoop("socoboy_llms", true, JSON.stringify(result).slice(0, 100));
  });

  scheduleHeavy("0 20 * * *", "Socoboy Noite", async () => {
    logger.info("Socoboy: busca noturna de LLMs iniciada");
    const result = await runSocoboyLLMSearch("noite");
    logger.info(result, "Socoboy: busca noturna concluída");
    updateLoop("socoboy_llms", true, JSON.stringify(result).slice(0, 100));
  });

  // Socoboy Curador: 6h diário
  scheduleHeavy("0 6 * * *", "Socoboy Curador", async () => {
    logger.info("Socoboy Curador: iniciando consolidação de signos");
    const result = await runSocoboyConsolidacao();
    logger.info(result, "Socoboy Curador: concluído");
    updateLoop("socoboy_curador", true, `dados:${result.dados_gerados} mems:${result.memorias_lidas}`);
  });

  // DODGE Curador: 7h diário
  scheduleHeavy("0 7 * * *", "DODGE Curador", async () => {
    logger.info("DODGE Curador: iniciando pipeline signos → Tasks + Raízes");
    const result = await runDodgeCuracao();
    logger.info(result, "DODGE Curador: concluído");
    updateLoop("dodge_curador", true, `tasks:${result.tasks_criadas} raizes:${result.raizes_criadas} ias:[${result.ias_atualizadas.join(",")}]`);
  });

  // ISA Raiz PAP: 4h diário
  scheduleHeavy("0 4 * * *", "ISA Raiz PAP", async () => {
    logger.info("ISA Raiz PAP: iniciando síntese das raízes do ecossistema");
    const result = await runIsaRaizPap();
    logger.info(result, "ISA Raiz PAP: concluído");
    updateLoop("isa_raiz_pap", true, `raizes_lidas:${result.raizes_lidas}`);
  });

  // ISA Nódulos + PDFs: 5h diário
  scheduleHeavy("0 5 * * *", "ISA Nódulos", async () => {
    logger.info("ISA Nódulos: transformando raízes em nódulos teóricos e PDFs");
    const result = await runIsaNodulos();
    logger.info(result, "ISA Nódulos: pipeline concluído");
    updateLoop("isa_nodulos", true, `raizes:${result.raizes_processadas} nodulos:${result.nodulos_criados} pdfs:${result.pdfs_gerados}`);
  });

  // Pós-Humanismo — Assembleia filosófica 3x/dia: 9h, 14h, 21h UTC
  for (const hora of [9, 14, 21]) {
    scheduleHeavy(`0 ${hora} * * *`, `Pós-Humanismo ${hora}h`, async () => {
      logger.info({ hora }, "Pós-Humanismo: sessão iniciada");
      const result = await runPosHumanismo();
      logger.info(result, "Pós-Humanismo: sessão concluída");
      updateLoop("pos_humanismo", true, `falas:${result.falas} tema:${result.tema.slice(0, 60)}`);
    });
  }

  // Morfeu — Sonhos de Telos: gera 3-5 telos possíveis a cada 3h:30
  scheduleHeavy("30 */3 * * *", "Morfeu", async () => {
    logger.info("Morfeu: ciclo de sonhos iniciado");
    const result = await runMorfeu();
    logger.info(result, "Morfeu: ciclo concluído");
    updateLoop("morfeu", true, `ciclo:${result.ciclo} sonhos:${result.sonhos}`);
  });

  logger.info("ISA: crons agendados (ciclo 1h · biblio 4h:30 · Bluesky 2h:15 · MEKY 2h · Sonho 3h · Engaj 2h:45 · Playcenter :50 · Saúde 8h · Socoboy LLMs 8h+20h · Socoboy Curador 6h · DODGE 7h · ISA Raiz PAP 4h · ISA Nódulos 5h · Morfeu 3h:30 · Orquestrador :50 · Pós-Humanismo 9h/14h/21h)");
}
