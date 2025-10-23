# 🤖 Bot Discord com IA Real

Um bot Discord com **IA real** (OpenAI/Groq) que gera respostas agressivas e sarcásticas dinamicamente, sem respostas prontas!

## ⚠️ AVISO

Este bot é apenas para fins de entretenimento e diversão. Use com responsabilidade e apenas em servidores onde os membros estão cientes do comportamento do bot.

## 🚀 Funcionalidades

- **IA Real**: Usa OpenAI GPT-3.5 ou Groq (gratuito) para gerar respostas únicas
- **Respostas Dinâmicas**: Cada resposta é gerada na hora, baseada no contexto da mensagem
- **Respostas Aleatórias**: 10% de chance de responder qualquer mensagem com IA
- **Resposta a Menções**: Sempre responde quando mencionado usando IA
- **Fallback Inteligente**: Se a IA falhar, usa respostas estáticas como backup
- **Delay Realista**: Adiciona delays aleatórios para parecer mais humano

## 📋 Pré-requisitos

- Node.js (versão 16 ou superior)
- Uma conta Discord
- Um bot Discord criado no Discord Developer Portal
- **API Key de IA** (OpenAI ou Groq)

## 🛠️ Instalação

1. **Clone ou baixe este repositório**

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o bot:**
   - Copie `config.example.env` para `.env`
   - Edite o arquivo `.env` e configure:
     - Seu token do bot Discord
     - API Key da IA (OpenAI ou Groq)

4. **Execute o bot:**
   ```bash
   npm start
   ```

## 🔧 Configuração

### Bot Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application" e dê um nome ao seu bot
3. Vá para a aba "Bot" no menu lateral
4. Clique em "Add Bot"
5. Em "Token", clique em "Copy" para copiar o token
6. Cole o token no arquivo `.env`

### API de IA

Você tem **duas opções**:

#### Opção 1: OpenAI (Recomendado - Pago)
1. Acesse [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Crie uma nova API key
3. Adicione no `.env`: `OPENAI_API_KEY=sk-sua-chave-aqui`

#### Opção 2: Groq (Gratuito)
1. Acesse [Groq Console](https://console.groq.com/keys)
2. Crie uma nova API key
3. Adicione no `.env`:
   ```
   GROQ_API_KEY=gsk-sua-chave-aqui
   USE_FREE_AI=true
   ```

**Importante**: Use apenas UMA das opções. Se tiver OpenAI_API_KEY, ela será usada automaticamente.

### Permissões Necessárias

Ao convidar o bot para seu servidor, certifique-se de dar as seguintes permissões:
- ✅ Read Messages
- ✅ Send Messages
- ✅ Read Message History
- ✅ Use External Emojis
- ✅ Add Reactions

## 🎮 Como Usar

1. **Respostas Aleatórias**: O bot tem 10% de chance de responder qualquer mensagem no chat usando IA
2. **Menções**: Mencione o bot com `@NomeDoBot` e ele sempre responderá com algo agressivo gerado pela IA
3. **Comportamento**: O bot ignora mensagens de outros bots
4. **IA Dinâmica**: Cada resposta é única e baseada no contexto da mensagem original

## 🎨 Personalização

### Personalizar Comportamento da IA

Você pode editar o prompt da IA no arquivo `ai-service.js`:

```javascript
content: "Você é um bot Discord agressivo e sarcástico. Suas respostas devem ser engraçadas, diretas e um pouco rudes, mas não ofensivas demais. Use emojis ocasionalmente. Seja criativo e varie suas respostas. Máximo 100 caracteres."
```

### Alterar Chance de Resposta

Para alterar a chance de resposta aleatória, modifique o valor `0.1` (10%) no arquivo `index.js`:

```javascript
if (randomChance < 0.1) { // Altere este valor (0.1 = 10%)
```

### Personalizar Respostas de Fallback

Se a IA falhar, o bot usa respostas estáticas. Você pode editá-las no arquivo `ai-service.js` na função `getFallbackResponse()`.

## 📝 Scripts Disponíveis

- `npm start`: Executa o bot
- `npm run dev`: Executa o bot com auto-reload (requer nodemon)

## ⚠️ Limitações e Avisos

- Este bot é apenas para diversão
- Use apenas em servidores apropriados
- Respeite as regras do Discord
- O bot pode ser banido se usado inadequadamente
- **Custos de API**: OpenAI cobra por uso (poucos centavos por resposta)
- **Groq**: Gratuito mas com limites de rate
- Se não configurar nenhuma API, o bot usará respostas estáticas

## 🤝 Contribuição

Sinta-se livre para contribuir com:
- Novas respostas criativas
- Melhorias no código
- Correção de bugs
- Novas funcionalidades

## 📄 Licença

MIT License - Use como quiser, mas com responsabilidade!

---

**Divirta-se, mas use com moderação! 😈**
