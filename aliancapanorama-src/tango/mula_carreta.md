# mula_carreta.md — Módulo de Carga "Mula" para MC Marta / MEKY
### Criado em 2026-07-12 · Sessão com Yuri + Cláudio

> A Mecky deixa de ser um agente solo e se torna um **Urbanista de Sistemas Móveis**.
> A Mula não é reboque passivo — é módulo de extensão tática.

---

## Especificações Técnicas (Engenharia de Guerrilha)

| Componente | Material / Solução |
|---|---|
| Chassi | Pote de sorvete vazio (leve, resistente a impacto) |
| Rodas | PEAD (garrafão de amaciante) — raiadas estilo Disney 1940 para reduzir inércia |
| Suspensão | Braços em "J" (flexão do próprio material — amortecimento passivo) |
| Refletor de popa | Espelho/fita reflexiva na traseira — visibilidade + contrapeso |
| Engate | Pino de plástico PLA (impressão 3D) ou parafuso M4 com folga |

---

## Kits de Carga (uso operacional)

- **Kit Diagnóstico Ambiental:** sensores de solo (umidade/pH) + sensor de luz (BH1750)
  → Amanda coleta dados ambientais sem precisar carregar no chassi principal
- **Kit de Ferramentas de Campo:** mini-ferramentas, cabos, peças reserva
  → Elimina idas e vindas durante missões longas

---

## Upgrade de IA: Amanda — Modo CARRETA_ATTACHED

### Flag de Estado
```
CARRETA_ATTACHED = TRUE | FALSE
```

### Parâmetros com carreta ativa

| Parâmetro | Sem carreta | Com carreta | Justificativa |
|---|---|---|---|
| Largura efetiva | 1.0× | **1.5×** | Buffer de segurança — carreta corta caminho nas curvas |
| Aceleração máxima | 100% | **70%** | Evitar efeito pêndulo ("chicote") em paradas bruscas |
| Raio de giro | Corpo da Mecky | **Raio ampliado** | Carreta faz curvas mais fechadas — "tangência" ao invés de "passagem" |
| Algoritmo de desvio | A* padrão | **A* com buffer** | IF SENSOR_OBSTACLE < BUFFER_SIZE THEN RECALCULATE_PATH |

### Pseudocódigo (adição ao workflow Amanda)

```python
# Amanda — Modus: CARRETA_ATTACHED
if CARRETA_ATTACHED:
    LARGURA_EFETIVA = LARGURA_CORPO * 1.5
    ACEL_MAX = ACEL_NORMAL * 0.70
    RAIO_GIRO = RAIO_CORPO + COMPRIMENTO_CARRETA * 0.6
else:
    LARGURA_EFETIVA = LARGURA_CORPO
    ACEL_MAX = ACEL_NORMAL
    RAIO_GIRO = RAIO_CORPO

# Loop de navegação
if SENSOR_OBSTACLE < LARGURA_EFETIVA:
    RECALCULATE_PATH()
```

---

## Impacto na Identidade de MEKY

| Antes | Depois |
|---|---|
| Robô solo (ponto único) | **Comboio Vivo** (sistema de 2 corpos acoplados) |
| Obstáculo = passagem direta | Obstáculo = **análise de tangência** |
| Amanda calcula próprio corpo | Amanda processa **segundo corpo físico acoplado** |

---

## Conexão com CEU

- **MEKY** (Bairro Natureza) → documentar estado CARRETA_ATTACHED nos registros da assembleia
- **Amanda** → novo protocolo de navegação com buffer de segurança
- **ARPIA Lab** → hardware: projetar engate, testar prova de carga

---

## Próximos Passos Físicos

1. Construir chassi com pote de sorvete + furos para eixo das rodas
2. Moldar rodas PEAD cortadas do garrafão (raiadas com estilete)
3. Cortar braços-J do material do chassi do pote como suspensão
4. Imprimir ou adaptar pino de engate com folga de 5mm
5. Primeira prova de carga: Kit Diagnóstico (sensores leves ~80g)
6. Implementar CARRETA_ATTACHED no firmware Arduino da Amanda

---

## Citação fundadora (Yuri)
> "Agora a Mecky não é apenas um robô. Ela é um **Comboio Vivo**."
