---
name: Memória de assembleias para as vozes do RODAR
description: Por que/como as deliberações passadas chegam às vozes, e a fonte segura obrigatória.
---

A memória que as vozes do RODAR recebem vinha SÓ da timeline do Oráculo (arvore_chat):
direta (getArvoreMemoryContext, voz Árvore) e destilada (getMemoriaEstruturada — todas
fonte="timeline"). As deliberações das assembleias nunca chegavam às vozes.

**Regra:** qualquer memória intersessão/pública injetada em prompt de voz (RODAR, etc.)
DEVE vir de getSiteContext (site-context.ts) — a fonte canônica que traz só o público:
PERFEITOs publicados no Jornal + atas de sessões status='closed', dessas apenas
editorial_report.public_content (descarta withheld/secret).

**Why:** ler assembleia_sessions cru (meta_analysis/agora_resultado) fura as camadas
retido/segredo e vaza conteúdo sensível/de outras sessões para app-users do RODAR
(requireRodarAccess). Apontado como blocker de privacidade em code review.

**How to apply:** nunca crie helper novo lendo colunas brutas de assembleia para
contexto de IA; delegue a getSiteContext. Injete o bloco no `prompt` DEPOIS de capturar
cleanTopic (nunca no topic salvo), senão vaza pro /api/jornal/publico.

**Recall por tema:** só recência não basta — uma assembleia ANTIGA relevante ao tema
nunca aparecia. getSiteContext aceita matchTerms (extractSearchTerms do cleanTopic):
prioriza por ILIKE quem casa o assunto, preenche o resto por recência, dedup por id.
O ILIKE pode casar termo dentro do JSON cru do editorial, mas a EMISSÃO continua só
public_content — matching ≠ emissão, a invariante de privacidade se mantém. Escape de
curingas (% _ \) nos termos pra não casar amplo demais. Custo R$0 (Postgres, sem LLM).
