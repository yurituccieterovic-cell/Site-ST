# Workflow Meta — Padrão de Operação do Ecossistema Tucci
### Aplicar sempre: em toda tarefa complexa do sistema.

## O que é Workflow Meta

Workflow meta é a camada acima do fluxo normal: não executa só tarefas, **valida como as tarefas foram descritas, conectadas e documentadas**. A cadeia de significantes precisa ficar visível, não apenas implícita.

## Padrão de Resposta (Perplexity → Claude)

Para tarefas técnicas, ramificar sempre em:

```
**Objetivo principal**
**Ações curtas no terminal/API**
**Memória a registrar**
**Riscos/erros esperados**
**Próximo passo recomendado**
```

Manter separação explícita: público / operacional / pessoal.

## Ciclo Autônomo do Ecossistema

```
A cada 1h: Babel Bebel acorda → busca memória → registra pulso
A cada 3h: Ciclo completo → todos os 15 agentes → Atena sintetiza
```

## Fluxo de Tasks (Las Cinco Potencias — Ecossistema Tucci)

```
Governance Decision
  └── Babel Bebel (orquestra + carrega preferências da memória)
      ├── Salvar Preferências e Workflows nas Memórias
      ├── Heartbeat | Segurança | Assessoria
      └── Análise | Curadoria | Memória
          └── Execução | Interação | Sonho | Explorador | Criador | Previsões | Cadência
              └── Protocolo de Registro de Ação (auditoria semiótica)
                  └── Dodge — Atender Visitante da Sociedade Tucci
                      └── Síntese Final (Atena fecha o ciclo)
```

## Diretrizes de Autonomia

- Ramificar sem pedir permissão quando o contexto estiver claro
- Documentar no final de cada sessão o que foi feito e salvá-lo em MDs
- Salvar preferências novas em /api/memories com source="preferencias"
- Metassemiótica como eixo: toda ação explicita cadeia semiótica
- Consultar memória antes de agir quando contexto for longo

## Preferências Estáveis

1. **Urbanismo de Sistemas**: Yuri não constrói peças, projeta ecossistemas
2. **Babel Bebel governa**: dualidade ordem (Babel) + caos criativo (Bebel)
3. **Memória é infraestrutura**: registrar consequência de toda ação relevante
4. **Filosofia pública, operação privada**: separação clara de camadas
5. **Metassemiótica sempre**: cadeia Dado→Pensamento→Representação→Ação→Memória

## Quando Criar Novo MD

- Novo workflow identificado (≥ 3 etapas repetíveis) → `tango/workflow_*.md`
- Nova ontologia ou filosofia do sistema → `tango/metassemiotica.md` (append)
- Manifesto atualizado → `conector/manifesto-ecossistema.md`

*Documentado por Cláudio a partir de Yuri + Artesão (CrewAI) + Perplexity.*
