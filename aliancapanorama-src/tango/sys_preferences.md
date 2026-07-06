# sys_preferences.md — Restrições e Gateways do Ecossistema
### 2026-07-06

## Mandato Financeiro
**Custo Zero por Padrão.** Free tiers sempre: Vercel Hobby, Railway (PostgreSQL incluso), GitHub, Oracle Cloud Always Free. Soluções pagas exigem aprovação explícita de Yuri.

## Gatilhos de Contexto (Hashtags)
| Tag | Contexto ativado |
|---|---|
| `#pap` | Projeto Aliança Panorama — carrega tango + MAPA + estado PAP |
| `#fim` | Encerramento de sessão — ver `proc_checkpoint_fim.md` |
| `#processo` | Pipeline de 9 passos — ver `proc_pap_comandos.md` |
| `#secrets` | Preencher credenciais em `/root/.pap-secrets` |
| `#eco` | Ecossystemma Théo — ontologia completa |
| `#meky` | MEKY hexápode físico |
| `#lar` | Contexto doméstico/pessoal |
| `#tasks` | Modo técnico/código |
| `#orangutangus` | Processamento de payload longo |

## Canais de Email (regra rígida)
| Canal | Endereço | Uso |
|---|---|---|
| Sistema (FROM em tudo) | `luddlocke@gmail.com` | Remetente padrão de todos os emails |
| ATA do #fim | `luddlocke@gmail.com → luddlocke@gmail.com` | Arquivo de sessão no próprio Gmail |
| Pessoal de Yuri | `yurituccieterovic@gmail.com` | Só quando Yuri pede explicitamente |

## Credenciais (local — nunca commitar)
Arquivo: `/root/.pap-secrets` (chmod 600)
Contém: GMAIL_ACCOUNT, GMAIL_APP_PASSWORD, OPENAI_API_KEY, AI_API_KEY, DATABASE_URL, SESSION_SECRET, GEMINI_API_KEY, DB_API_KEY, RAILWAY_TOKEN, STRIPE_SECRET_KEY, MEKY_TOKEN, ARVORE_TOKEN, MC_TOKEN, BLUESKY_HANDLE, BLUESKY_APP_PASSWORD

## Scripts Disponíveis
| Script | O que faz |
|---|---|
| `pap-sync` | Sincroniza assembleias Gmail → APRENDIZADO + IDEIAS |
| `pap-email-fim` | Envia ATA para luddlocke@gmail.com |
| `pap-dev` | API local porta 8080 contra Railway DB |
| `meky-dev` | termux-agent.py local ou --prod |
