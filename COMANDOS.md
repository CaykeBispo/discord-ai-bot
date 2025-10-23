# 🤖 Comandos do Bot Agressivo

## 📋 Lista de Comandos

### 🧹 `bbcl` - Limpeza de Mensagens
**Descrição:** Deleta as últimas 50 mensagens do usuário que executou o comando.

**Como usar:**
- Digite `bbcl` no chat
- O bot irá deletar automaticamente suas últimas 50 mensagens
- A mensagem do comando também será deletada

**Características:**
- ✅ **Cooldown:** 30 segundos entre usos
- ✅ **Limite:** 50 mensagens por vez
- ✅ **Seguro:** Só deleta mensagens que podem ser deletadas
- ✅ **Feedback:** Mostra progresso e resultado
- ✅ **Auto-limpeza:** Remove mensagens de confirmação após 5 segundos

**Exemplo:**
```
Usuário: bbcl
Bot: 🧹 Iniciando limpeza de 50 mensagens...
     ⏳ Isso pode levar alguns segundos...
     
[Após alguns segundos]
Bot: ✅ Limpeza concluída!
     🗑️ 50 mensagens deletadas
     ⏰ Cooldown: 30 segundos
```

**Permissões necessárias:**
- O bot precisa ter permissão `Gerenciar Mensagens` no canal

**Limitações:**
- Só funciona com mensagens que têm menos de 14 dias
- Discord limita a 100 mensagens por busca
- Rate limit do Discord pode causar pequenas pausas

---

## 🔧 Configurações Avançadas

### Personalizar o Comando
Para alterar o comando ou configurações, edite o arquivo `clear-messages.js`:

```javascript
class ClearMessagesService {
    constructor() {
        this.COMMAND = 'bbcl';           // Comando a ser digitado
        this.MESSAGE_LIMIT = 25;         // Número de mensagens para deletar
        this.COOLDOWN_TIME = 30000;      // Cooldown em milissegundos (30s)
    }
}
```

### Exemplos de Personalização:
- **Comando diferente:** `this.COMMAND = 'clear'`
- **Mais mensagens:** `this.MESSAGE_LIMIT = 100`
- **Cooldown maior:** `this.COOLDOWN_TIME = 60000` (1 minuto)

---

## 🚨 Resolução de Problemas

### Bot não responde ao comando
1. Verifique se o bot tem permissão `Gerenciar Mensagens`
2. Confirme se digitou exatamente `bbcl` (case-insensitive)
3. Verifique se não está em cooldown (30 segundos)

### Erro de permissão
```
❌ Eu não tenho permissão para deletar mensagens neste canal!
```
**Solução:** Dar permissão `Gerenciar Mensagens` ao bot no canal

### Mensagens antigas não são deletadas
**Limitação do Discord:** Mensagens com mais de 14 dias não podem ser deletadas via API

### Rate Limit
O bot automaticamente faz pausas entre operações para evitar rate limits do Discord.

---

## 📊 Logs do Sistema

O comando gera logs detalhados para monitoramento:

```
🧹 Comando de limpeza detectado de username
🗑️ Iniciando limpeza de 50 mensagens do usuário userId no canal channelId
🔍 Buscando 50 mensagens (0/50 deletadas)
🎯 Encontradas 10 mensagens do usuário para deletar
✅ Lote deletado: 10 mensagens (Total: 10/50)
🎉 Limpeza concluída! Total de mensagens deletadas: 50
```
