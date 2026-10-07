---
name: Pipeline de vídeo/áudio do PERFEITO (ElevenLabs + ffmpeg, sem D-ID)
description: O que a ElevenLabs faz, os dois entregáveis opt-in (áudio e vídeo simbólico), e por que o vídeo deixou de usar D-ID.
---

A ElevenLabs no SalesCockpit é SÓ a voz do entregável pós-PERFEITO. A voz da Árvore que
toca no Oráculo é OpenAI, NÃO ElevenLabs. A chave ElevenLabs serve exclusivamente pra esse
passo final.

**Dois entregáveis opt-in, independentes (background, não bloqueiam o pipeline):**
- `gerarVideo` → NARRAÇÃO EM ÁUDIO (MP3) só-ElevenLabs (`narracao-audio.ts`).
- `gerarVideoReal` → VÍDEO SIMBÓLICO (`video-simbolico.ts`): a mesma voz ElevenLabs lendo o
  PERFEITO sobre as imagens-símbolo da Árvore (núcleo orbital), montado LOCALMENTE com ffmpeg.
  Sem D-ID, sem rosto. Custo = só a voz.

**Decisão (Yuri):** nada de talking-head com a cara dele e nada de serviço pago de lip-sync.
Lip-sync grátis não existe; então o "vídeo" é voz + imagens simbólicas via ffmpeg. **Why:**
custo ~R$0 além da voz que ele já paga, e a identidade fica na Árvore, não no rosto.

**How to apply / o que lembrar:**
- Os nomes dos toggles NÃO mudaram em toda a cadeia (frontend → prepare → finalize → ágora →
  secretário): `gerarVideo`=áudio, `gerarVideoReal`=vídeo simbólico. Não renomear sem varrer
  a cadeia inteira.
- D-ID foi APOSENTADO: `talking-head.ts` virou código morto (não é mais importado). As envs
  DID_API_KEY/DID_SOURCE_URL não são mais usadas.
- Assets do vídeo: `artifacts/api-server/assets/arvore-nucleo/concept-{a,b,c}.png`. Em runtime
  o CWD é o diretório do pacote (pnpm --filter roda o script de lá), então resolver via
  `path.join(process.cwd(), "assets", ...)`. Se uma imagem faltar, usa só as que existirem.
- ffmpeg/ffprobe NÃO existem no servidor PUBLICADO (só no dev via Nix) — em prod dá
  `spawn ffprobe ENOENT`. Os binários vêm empacotados como dependência: ffmpeg via
  `@ffmpeg-installer/ffmpeg` (.path) e ffprobe via `ffprobe-static` (.path), ambos com
  binário embutido (sem script de download — o pnpm IGNORA build scripts, então não pode
  depender de postinstall como o `ffmpeg-static`). Resolver o caminho com `createRequire`
  (NÃO `import` estático, senão o esbuild tenta bundlar o binário) e fallback pro binário
  do sistema. **Why:** dev tem ffmpeg no PATH, prod não — o que funciona aqui pode quebrar lá.
- CUIDADO: o binário do `@ffmpeg-installer/ffmpeg` é ANTIGO (build 2018, N-47683) e NÃO tem
  o filtro `xfade` (que só existe em ffmpeg ≥4.3). Em dev o ffmpeg do sistema é novo e tem
  xfade; em prod o empacotado dá `No such filter: 'xfade'` e o vídeo falha SÓ na produção.
  **Why:** o filtergraph tem que rodar no binário velho que vai pro ar, não no do sistema.
  **How to apply:** não usar `xfade` (nem outros filtros novos). A transição é feita com
  `fade=t=out` no fim de cada clipe + `fade=t=in` no começo do próximo (dissolve pelo preto)
  e os clipes são CONCATENADOS (`concat=n=N:v=1:a=0`). Validar qualquer filtergraph novo
  rodando o binário do `@ffmpeg-installer` direto, não o do PATH.
- Recipe do Ken Burns + transições (sem xfade):
  scale pra 2x o tamanho final ANTES do `zoompan` (senão treme); cada clipe leva
  `fade=t=in:st=0` e `fade=t=out` perto do fim; os clipes têm duração igual (áudio/N, SEM
  sobreposição) e são concatenados. `-shortest` corta no fim do áudio.
- Pra gerar/validar um vídeo de sessão antiga fora do pipeline: o PERFEITO NÃO fica salvo em
  coluna; o mais próximo recuperável é `assembleia_sessions.agora_resultado` (o RESULTADO).
  Texto >9000 chars é condensado (Groq/Cerebras grátis) antes do TTS. Rodar a função real
  exige bundle esbuild (não há tsx) com NODE_ENV=production (senão o pino abre worker e
  quebra em ESM) e por um WORKFLOW gerenciado (processo de ~minutos é morto se rodar
  desanexado via nohup no shell).
- Toda chamada externa (ElevenLabs) e todo subprocesso (ffmpeg/ffprobe) precisa de timeout —
  senão um stall trava o job em background pra sempre (mesma lição de streaming-timeouts).
- GARGALO da render é a CPU do SERVIDOR PUBLICADO, não o filtergraph. Benchmark com o MESMO
  binário empacotado: em dev 60s de vídeo monta em ~7s; remover o `zoompan` NÃO acelera (até
  piora). A CPU do deploy é ~7-8x mais lenta que a de dev, então a render de um PERFEITO longo
  pode passar de vários minutos. **Why:** um timeout dimensionado pra dev estoura SÓ em prod
  (foi o caso do teto de 240s). **How to apply:** o timeout do ffmpeg é de um job em background
  (chamado com `void gerarVideoSimbolico` em runSecretario, não bloqueia requisição), então
  pode ser generoso (15 min); não perca tempo "otimizando o filtro" — meça com o binário do
  `@ffmpeg-installer` antes de mexer. fps 24 (não 30) já alivia a CPU e encolhe o arquivo.
- Se o voice id não estiver setado, lista as vozes da conta e usa a 1ª (listar voz NÃO gasta
  crédito; só o TTS gasta). Pra fixar, setar ELEVENLABS_VOICE_ID.
- Entrega por email pro endereço autoral (ver replit.md): áudio = MP3, vídeo = MP4 anexado.
- Síntese de voz é compartilhada: `synthesizePerfeitoAudio()` em narracao-audio.ts é usada
  tanto pelo áudio quanto pelo vídeo (uma fonte só pra voz).
- O vídeo simbólico narra um TRECHO curado pelas vozes, NÃO o PERFEITO inteiro. **Why:** o
  PERFEITO inteiro dava narração de ~7 min e estourava tempo/tamanho na render. As vozes da
  Ágora escolhem parágrafos + deixam comentário; agrega-se em janela contígua com teto curto
  (~1500 chars ≈ ~1-2 min). **How to apply:** a curadoria roda em background (não bloqueia o
  pipeline) e NUNCA lança — sem voto válido cai no começo do PERFEITO; o comentário das vozes
  é texto livre, então o parse do JSON da IA precisa de fallback por campo (regex), nunca só
  `JSON.parse` estrito (aspas/quebras no comentário quebram o estrito o tempo todo).
