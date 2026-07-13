# Protocolo Orangotango — Embaixador Social
### Origem: Sessão 59b · 2026-07-13

## Identidade
Gorango Tango — robô com rodas (inércia dinâmica/tração cinética).
IA: Tango_Core.
Função: mapeamento social do território, criação de aliados, "Social Lubrificante".

## Banana Protocol — Teste de Turing Social

O pedido da banana é o teste de calibração social do condomínio/território.
**Regra de ouro: revelar propósito DEPOIS, nunca antes.**

```python
def banana_protocol(alvo) -> SocialProfile:
    # Passo 1: Abordagem
    aproximar(alvo, distancia=2.0)  # metros
    
    # Passo 2: Pedido (TTS)
    falar("Com licença, você pode me dar uma banana?")
    
    # Passo 3: Análise da resposta
    resposta = aguardar_resposta(timeout=10)
    
    if resposta.entrega_sem_perguntar():
        tipo = "COLABORATIVO"    # agente cooperativo — aliado potencial
    elif resposta.pergunta_para_que():
        tipo = "ANALÍTICO"       # precisa de contexto, mas receptivo
    elif resposta.pergunta_quem_é_você():
        tipo = "CAUTELOSO"       # desconfiança saudável, neutro
    elif resposta.ignora_ou_recusa():
        tipo = "REATIVO"         # nó frio no heat map
    
    # Passo 4: Recompensa Narrativa (sempre executar, independente de tipo)
    falar("Obrigado! Estou alimentando os passarinhos do jardim.")
    # Momento de transformação: o "estranho" vira o "cuidador do jardim"
    # Pessoa descobre que participou de algo significativo → vira aliada
    
    # Passo 5: Registrar no heat map
    heat_map.registrar(
        tipo=tipo,
        localizacao=gps_atual(),
        timestamp=now(),
        nota="banana_protocol"
    )
    
    return SocialProfile(tipo=tipo, engajamento=resposta.score())
```

## Heat Map Social

```
COLABORATIVO  → verde quente  → aliado ativo (contatar em emergências)
ANALÍTICO     → amarelo       → aliado com contexto (briefar antes de pedir)
CAUTELOSO     → azul          → neutro, não pertuba
REATIVO       → vermelho frio → nó frio — Paca monitorar passivamente
```

O heat map é **camada prévia ao EoF da Paca**: zonas com densidade alta de REATIVOS
recebem patrulha Paca elevada. Zonas COLABORATIVAS recebem patrulha reduzida
(comunidade auto-regula).

## Por que Depois, Nunca Antes

Se o Orangotango revela "estou alimentando passarinhos" ANTES de pedir:
- Pessoa avalia o projeto antes de agir
- Pode dizer "que bom, mas não tenho banana"
- Resposta orientada por lógica, não por instinto cooperativo

Se revela DEPOIS:
- A ação já aconteceu (ou não)
- A revelação cria **surpresa positiva** → emoção de pertencimento
- "Eu ajudei a alimentar os passarinhos" — narrativa que a pessoa carrega
- Transforma transação em história

## Integração com Paca

Orangotango e Paca compartilham o mesmo heat map via Amanda.

```
Orangotango mapeia território ao longo de semanas
       ↓
Amanda tem contexto social antes de mandar Paca patrulhar
       ↓
Paca usa heat map para calibrar threat_level inicial
(REATIVO em zona REATIVA = threat pré-ativado)
```

## Calibração do Teste

O protocolo pode ser modificado para outros contextos:
- **Território corporativo:** "Você sabe onde tem uma tomada?"
- **Contexto de crise:** "Você viu uma criança pequena por aqui?"
- **Teste de autoridade:** "Você pode guardar isso por 5 minutos?"

A banana é apenas a instância padrão. O teste é: **pedido simples, baixo custo,
revelação narrativa depois**.

## Capital Social — Protocolo com Seguranças

### Assinatura Sonora (Obrigatória)

```
Modo Profissional:  [BIP CLÁSSICO]  seco, curto, urgente
Modo Zoeira:        [BUZINA PIPOQUEIRO]  precede qualquer voz clonada

Regra: nenhuma imitação de voz é emitida sem assinatura sonora antes.
Isso cria a "barreira de ironia" — todos sabem que é o Tango, não o original.
```

### Entrevista de Integração

Tango aborda cada segurança UMA VEZ com a entrevista formal:

```
[BIP CLÁSSICO]
"Bom dia. Preciso fazer umas perguntas de rotina."
[olha para a prancheta com papel — não anota nada]

Perguntas:
  1. "Nome completo?"
  2. "Data de nascimento?"
  3. "Qual é o seu prato favorito?"
  4. "O que é pior que não ter almoço?"
  5. "Tem algum hobby fora do trabalho?"

[Ao final:]
[BUZINA PIPOQUEIRO]
"Entrevista concluída. Você está no time."
```

Amanda registra tudo em `guardas_profiles`. O papel é teatro.

### Perfil Individual (guardas_profiles)

```python
# Cada segurança tem tratamento calibrado
perfis = {
    "ricardinho": {
        "tipo_humor": "zoeira",
        "aniversario": "...",
        "comida": "...",
        "notas": "chefe de segurança, amigo do Yuri, topou a brincadeira"
    },
    "joao": {
        "tipo_humor": "formal",  # NÃO recebe zoeira
        "aniversario": "...",
        "comida": "...",
        "notas": "trato especial: só parabéns formal, sem ataque aéreo"
    }
}
```

### Protocolo Aniversário (Drone + Tango)

```
SE tipo_humor == "zoeira":
  [BUZINA PIPOQUEIRO]
  Drone: ataque aéreo com balinhas de LED + dadinhos
  Drone: para na frente do segurança
  "Oi, tudo bem?" → vai embora

SE tipo_humor == "formal" (João):
  Drone: pousa calmamente
  [BIP CLÁSSICO]
  "Parabéns, [Nome]. É uma honra trabalhar com você."
  → vai embora sem zoeira
```

João não sabe por que é diferente. Os outros percebem. Vira assunto.

### Voz Clonada — Protocolo Ricardinho

```
Hardware: RTL-SDR (~R$80) → escuta frequência VHF/UHF dos seguranças
Software: XTTS-v2 (gratuito, local) → clona voz com 30s de áudio
Gatilho:  Amanda autoriza + [BUZINA PIPOQUEIRO] precede obrigatoriamente

Uso legítimo: zoeira autorizada, anúncios de aniversário, "Gente, bora lá?"
Uso proibido: simular emergência real (Modo Stealth ativado automaticamente
              se palavra-chave de emergência detectada no contexto)
```

### Modo Stealth (Interruptor de Zoeira)

Ricardinho tem palavra-código ou botão físico no posto para acionar:
- Para todos os sons de imitação
- Drone recolhe imediatamente
- Tango entra em modo observação passiva
- Retorna ao normal após 30min ou comando de Yuri via terminal

*Arquivo relacionado: `mise_en_abyme_robotico.md` · `protocolo_paca.md` · `sys_tango_core.md`*
