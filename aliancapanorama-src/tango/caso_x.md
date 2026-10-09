# Caso X — Inventário Doméstico + Requisitos do Colesterol

> **O que é**: Sistema de gestão de compras e inventário doméstico para Yuri + Mayumi.
> **Software derivado**: Colesterol — app de compras colaborativo (ideias I916-I921, I906-I908, I988-I991).
> **Última atualização**: 2026-10-08 (S201)

---

## 1. Filosofia do sistema

O Caso X é um **inventário vivo de necessidades**, não uma lista de compras. A distinção é:
- "Quero comprar" ≠ "Já comprei" ≠ "Estou considerando" ≠ "Mayumi não aprovou"
- Cada item tem estado, responsável, validade e rastreabilidade de compra
- O sistema aprende com o histórico (quando foi comprado, quanto custou, onde)

### Estados possíveis de um item

| Estado | Significado |
|---|---|
| `comprar_agora` | Prioridade confirmada |
| `comprar_depois` | Útil mas não urgente |
| `ja_temos` | Já existe na casa |
| `verificar_mayumi` | Mayumi pode já ter ou precisa aprovar |
| `buscar_familia` | Pegar emprestado ou de presente |
| `consertar` | Consertar antes de comprar novo |
| `esperar_autorizacao` | Custo elevado — decidir juntos |
| `comprar_em_viagem` | Mais barato em outra cidade ou país |
| `dividir_custo` | Comprar com Mayumi, Clara Lisa ou outro |
| `cancelado` | Não vai mais comprar |
| `registrar_preco` | Pesquisar antes de decidir |

---

## 2. Schema de item (JSON)

```json
{
  "item": "Termômetro digital",
  "categoria": "saude",
  "status": "comprar_agora",
  "prioridade": "alta",
  "quantidade": 1,
  "ja_existe": false,
  "responsavel": "yuri",
  "fornecedor": null,
  "preco": null,
  "validade": null,
  "observacao": "modelo simples, durável e barato",
  "comprado_em": null,
  "comprado_por": null,
  "substituicao_de": null
}
```

---

## 3. Kit de saúde e primeiros socorros

### Já temos / verificar Mayumi

| Item | Status | Observação |
|---|---|---|
| Dipirona | `ja_temos` | |
| Loratadina | `ja_temos` | |
| Hipoglós | `ja_temos` | |
| Soro fisiológico | `ja_temos` | |
| Álcool 70% | `ja_temos` | |
| Lufital | `ja_temos` | |
| Quetiapina | `ja_temos` | Separada, embalagem original, conforme prescrição |
| Bolsa térmica | `verificar_mayumi` | Mayumi tem uma |

### Comprar agora (prioridade)

| Item | Status | Observação |
|---|---|---|
| Nebacetin | `comprar_agora` | Só uso tópico pontual; não usar em boca, olhos, feridas profundas |
| Merthiolate spray (sem álcool) | `comprar_agora` | Base clorexidina — menos ardência; Mercado Livre |
| Própolis em spray | `comprar_agora` | Uso oral conforme rótulo; Mercado Livre |
| Bepantol labial | `comprar_agora` | Hidratação labial — não é antibiótico |
| Band-aids variados | `comprar_agora` | |
| Gaze | `comprar_agora` | |
| Micropore | `comprar_agora` | |
| Algodão + embalagem | `comprar_agora` | |
| Luvas descartáveis | `comprar_agora` | |
| Tesoura pequena/média | `comprar_agora` | Limpa, dedicada ao kit |
| Pinça | `comprar_agora` | 1 ou 2, se houver uso real |
| Termômetro digital | `comprar_agora` | Simples, durável |
| Colírio lubrificante | `comprar_agora` | Base carmelose/CMC, sem conservantes, sem vasoconstritor |
| Estojo rígido ou nécessaire | `comprar_agora` | Para curativos |

### Comprar depois

| Item | Status | Observação |
|---|---|---|
| Antigripal | `comprar_depois` | Escolher UM; verificar composição e contraindicações |
| Eno | `comprar_depois` | |
| Bepantol corporal | `comprar_depois` | Já tem Hipoglós para assadura |
| Laxante | `comprar_depois` | Só para constipação ocasional, conforme bula |
| Pomada com corticoide | `comprar_depois` | |
| Colírio medicamentoso | `comprar_depois` | |
| Gelol ou equivalente | `comprar_depois` | Ver abaixo |
| Bolsa térmica extra | `comprar_depois` | Presente para Mayumi — sem urgência |

### Sobre o Gelol
- Aerossol: salicilato de metila + cânfora + mentol
- Aerossol tende a ser mais caro que pomada
- **Alternativa**: pomada ou creme genérico para dor muscular (comparar composição e preço/grama)
- Não aplicar em ferida, mucosa, olhos, pele irritada, nem cobrir com curativo
- Evitar em alergias a salicilatos ou uso de anticoagulante

---

## 4. Organização física do kit

```
Estojo principal — curativos
├── Band-aids
├── Gaze
├── Micropore
├── Luvas
├── Tesoura
├── Pinça
└── Termômetro

Necessaire separada — medicamentos
├── Medicamentos pessoais (embalagens originais)
├── Itens com bula
└── Lista de validade e instruções

Bolsa térmica — fora do estojo, item doméstico
```

**Regras de armazenamento:**
- Local seco, fresco, fora do alcance de crianças e animais
- Não guardar medicamentos no banheiro (calor + umidade)
- Revisar validades periodicamente
- Se espaço da Mayumi for limitado, kit pode ficar na casa do Yuri

---

## 5. Itens domésticos e de cozinha

### Comprar / providenciar

| Item | Status | Observação |
|---|---|---|
| Lixeira de cozinha | `comprar_agora` | |
| Pá de lixo | `comprar_agora` | |
| Vassoura | `ja_temos` | Trazida da mãe |
| Panos de chão | `comprar_agora` | |
| Panos de prato | `comprar_agora` | |
| Luva de forno | `ja_temos` | Kit de 2; uma como presente para Mayumi |
| Carregador aspirador | `comprar_agora` | |
| Adaptador regador pequeno | `verificar_mayumi` | |
| Concha | `comprar_agora` | |
| Pegador de arroz | `comprar_agora` | |
| Pegador de macarrão | `comprar_agora` | |
| Colher de pau | `comprar_agora` | Possível versão personalizada |
| Potes de tempero | `comprar_agora` | Buscar alternativa barata |
| Espremedor de laranja | `comprar_depois` | Ver decisão pendente |
| Ralador de melhor qualidade | `comprar_depois` | |
| Processador de alho | `comprar_depois` | Opcional |
| Potes e organizadores | `comprar_depois` | |
| Lenço umedecido | `comprar_agora` | |

### Decisões pendentes

| Item | Decisão |
|---|---|
| Espremedor | Manual barato ou continuar usando o emprestado da mãe? |
| Panela de pressão | Consertar (comprar só a borracha) ou avaliar? |
| Facão | Pedir emprestado à mãe ou comprar depois? |
| Aspirador portátil sofá/carro | Comprar sozinho ou dividir com Mayumi + Clara Lisa? |

---

## 6. Casa, carro e jardim

| Item | Status | Observação |
|---|---|---|
| Molho da avó | `buscar_familia` | |
| Trim | `buscar_familia` | |
| Rosa miniatura trepadeira | `comprar_depois` | |
| Pendurar quadros | `consertar` | Tarefa doméstica |
| Insulfilm no carro da Mayumi | `comprar_depois` | |
| Lâmpada do carro | `consertar` | |
| Retrovisor automático | `verificar_mayumi` | Checar |
| Carregador aspirador | `comprar_agora` | |
| Vape seco | `esperar_autorizacao` | Decidir se compartilha com Mayumi + Clara Lisa |

---

## 7. Alimentos — sacolão (compra presencial)

| Item | Qtd sugerida | Status |
|---|---|---|
| Ovos | — | `comprar_agora` |
| Banana | — | `comprar_agora` |
| Açúcar | — | `comprar_agora` |
| Mamão | — | `comprar_agora` |
| Pera | — | `comprar_agora` |
| Limão | — | `comprar_agora` |
| Óleo de coco | — | `comprar_agora` |
| Mel (para cozinhar) | — | `comprar_agora` |
| Cebola branca e roxa | — | `comprar_agora` |
| Alho | — | `comprar_agora` |
| Batata-doce | — | `comprar_agora` |
| Banana-da-terra | — | `comprar_agora` |
| Beterraba | — | `comprar_agora` |
| Espinafre | — | `comprar_agora` |
| Esponja de cozinha | — | `comprar_agora` |

---

## 8. Grãos, sementes e castanhas (referência para 2 pessoas)

| Item | Qtd referência | Observação |
|---|---|---|
| Aveia em flocos grossos | 1 kg | |
| Farelo de aveia | ~500 g | |
| Castanha-do-Pará | 250 g | |
| Castanha-de-caju | 250 g | |
| Amêndoas laminadas | 600 g | |
| Nozes | ~250 g | |
| Avelã | 450 g | |
| Macadâmia | 300 g | |
| Amendoim | 500 g | Dividir torrado/cru para testar torra |
| Damasco seco | 400 g | |
| Uva-passa | ~600 g | |
| Frutas cristalizadas | ~100 g | Só para receita |
| Coco chips/lascas (natural, s/açúcar) | 400 g | |
| Gergelim c/ casca torrado | 200 g | |
| Gergelim preto | 200 g | |
| Linhaça marrom + dourada | 600 g total | |
| Chia | 300 g | |
| Semente de abóbora crua | 300 g | |
| Quinoa | 300 g | |
| Cevada ou centeio | 500 g | Para teste |
| Cacau em pó 100% | 300 g | |
| Açúcar mascavo | 500 g | |
| Mix feijões + lentilha | ~3 kg total | Preto, vermelho, fradinho, branco, azuki, jalo, lentilha |
| Arroz integral/variedades | ~2 kg | |

**Atenção:** Comprar em quantidades menores na primeira vez. Oleaginosas e sementes em local seco, bem fechado, longe de calor. Se só houver saquinhos, reduzir quantidade ou usar geladeira quando indicado.

---

## 9. Registro de compra (estrutura do Colesterol)

Quando Yuri enviar o que foi comprado, o sistema transforma em histórico:

```json
{
  "item": "Band-aids sortidos",
  "comprado": true,
  "data": "2026-10-09",
  "loja": "Farmácia Popular",
  "preco": 12.90,
  "quantidade": 1,
  "substitui": null,
  "desconto": null,
  "pago_por": "yuri",
  "estado_final": "comprado"
}
```

---

## 10. Desenvolvimento do Colesterol — roadmap derivado do Caso X

Ver IDEIAS.md: I916-I921 (S186) + I988-I991 (S201)

### Fase 1 — MVP (do Caso X)
- Lista compartilhada Yuri + Mayumi com estados
- Input por voz (transcrição → itens)
- Categorias: saúde, cozinha, alimentos, casa/carro, grãos
- Histórico de compras

### Fase 2 — Inteligência
- Cache de preços (I917)
- Crowdsourcing de preços (I918)
- Compra por receita/NLP (I919)
- Modo evento — churrasco, jantar (I920)

### Fase 3 — Integração
- Colesterol ↔ Age/SABIÁ (restrições alimentares, I921)
- Colesterol ↔ Rapadura (controle de gastos domésticos)
