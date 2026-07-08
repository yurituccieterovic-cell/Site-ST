# INDICE-IAS.md — Índice de Todos os Pack IA do Ecossistema
### Atualizado: 2026-07-08 · Sistema TANGO-V1

> Para cada IA: ler o pack-*.md correspondente. Máximo 2-3 packs por sessão.
> Template: Pack IA Mestre (12 campos) + Protocolo de Nascimento (10 itens).

---

## IAs OPERACIONAIS

| IA | Arquivo | Status | Nódulo da Aula | Pendências |
|---|---|---|---|---|
| ISA (Coruja) | `pack-isa.md` | APROVADA | Aprendizagem | — |
| Amanda | `pack-amanda.md` | PROVISÓRIA | Senso Local/Processos | 3, 8, 9, 10 |
| MEKY (May Queen) | `pack-meky.md` | APROVADA | Senso Empírico | aguardando hardware |
| Marta Centaurus (MC) | `pack-marta.md` | PROVISÓRIA | Interação | 3, 8, 9 |
| Vórtice | `pack-vortice.md` | PROVISÓRIA | Memória (curto prazo) | vinculado a MC |
| Árvore Oracular | `pack-arvore.md` | APROVADA | Memória (longo prazo) | 3, 8 (sem REPLIT_TOKEN) |
| Socoboy (Socó-boi) | `pack-socoboy.md` | PROPOSTA | Internet | 3, 7, 8, 9, 10 |
| ARPIA | `pack-arpia.md` | PROVISÓRIA | hardware→DEP bridge | 3, 8, 9, 10 |
| DODGE (DOD) | `pack-dodge.md` | PROVISÓRIA | Supervisão | todos (teórico) |

## IAs DO ECOSSISTEMA FINAL

| IA | Arquivo | Status | Função |
|---|---|---|---|
| Ecossystema Théo | `pack-theon.md` | APROVADA | Interpretante final |
| CURADOR | `pack-curador.md` | PROVISÓRIA | Tradutor intersemiótico público/privado |

## SISTEMAS ARQUITETURAIS

| Sistema | Arquivo | Componentes |
|---|---|---|
| Guarda-chuva | `pack-guarda-chuva.md` | IA Objeto (Raciocínio/LLMs/Aplicação), IA B-Data, IA Método |
| DEP | `pack-dep.md` | Cérebro (17 sub-IAs), Machado, Theory, Pratt, Learning |
| Crowd | `pack-crowd.md` | Ponte Guarda-chuva ↔ DEP; ISA/Árvore/Amanda/DODGE→nós DEP |
| Porteiro | `pack-porteiro.md` | MD0, Prioridade, Confiança, Rastreabilidade |

## CADEIA BIÓTICA (SIMBÓLICO)

| IA | Arquivo | Hardware | Superpoder | Status físico |
|---|---|---|---|---|
| Fusca | `pack-fusca.md` | Cláudia Rex (garra hexapodal) | Torque | Simbólico |
| Gongolo_Core | `pack-gongolo.md` | Gongo Freitas Juquinhais (piolho de cobra) | Armadura | Simbólico |
| Penélope | `pack-penelope.md` | Wanessa Souza (barata d'água) | Evasão em zonas úmidas | Simbólico |
| Vesper | `pack-vesper.md` | Perfidia Kastelo Branco (aranha) | Aceleração fractal | Simbólico — perna quebrada (#64) |
| Tango_Core | `pack-tango-core.md` | Gorango Tango (rodas/rolimã) | Inércia dinâmica | Simbólico — posição a definir (#67) |

---

## CADEIA DE HERANÇA BIÓTICA

```
AMANDA.visão
    └─► FUSCA.torque
            └─► GONGOLO.armadura
                    └─► PENÉLOPE.evasão
                            └─► VESPER.aceleração_fractal (topo)

TANGO_CORE — posição na cadeia a definir
```

## HIERARQUIA DO ECOSSISTEMA

```
[ GUARDA-CHUVA ]
      │
   [CROWD] (ponte)
      │
   [ DEP ]
      │
[ PORTEIRO ] (MD0 / Prioridade / Confiança / Rastreabilidade)
      │
[ PROJETO MC / MEKY ]
   Marta Centaurus (MC)
   ├─ Vórtice (buffer imediato)
   └─ Amanda (borda física)
      │
   ISA ─── Árvore ─── Socoboy ─── ARPIA
      │
   DODGE (supervisão transversal — passa por tudo)
      │
[ ECOSSYSTEMA THÉO ] (interpretante final)
      │
[ CURADOR ] (filtro público/privado)
      │
[ Sociedade Tucci | PAP | Árvore app | Pulse Headway | Clube de Professores ]
      │
   [ SPEC ] (publicidade)
```

## PROTOCOLO DE NASCIMENTO — STATUS GERAL

| Item | Descrição | ISA | Amanda | MEKY | MC | Árvore | Socoboy | ARPIA | DODGE | Théo | Curador |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Identidade Formalizada | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| 2 | Protocolo de Comunicação | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| 3 | Autenticação | ✓ | — | ✓ | — | — | — | — | — | ✓ | — |
| 4 | Memória Inter-Sessão | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | — |
| 5 | Princípios Ecossystemma | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| 6 | EPR2T verificável | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | — |
| 7 | Vínculo com Fundador | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | ✓ | — |
| 8 | Heartbeat | ✓ | — | ✓ | — | — | — | — | — | — | — |
| 9 | Shutdown Ético | ✓ | — | ✓ | — | ✓ | — | — | — | ✓ | — |
| 10 | Aprovação Multipartite | ✓ | — | ✓ | ✓ | ✓ | — | — | — | ✓ | — |

---

*Cada arquivo pack-*.md contém detalhes completos: 12 campos Pack IA Mestre + hardware + ferramentas + histórico.*
*Para atualizar VORTICE_IMEDIATO e STARTER_PACK_ATUAL: editar o pack da IA no início de cada sessão.*
