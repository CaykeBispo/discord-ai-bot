const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const AIService = require('./ai-service');
const ClearMessagesService = require('./clear-messages');

// Criar cliente Discord
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Inicializar serviços
const aiService = new AIService();
const clearMessagesService = new ClearMessagesService();

// Sistema anti-spam para evitar respostas duplicadas
const lastResponses = new Map(); // channelId -> { lastResponse: string, timestamp: number, lastUser: string }
const userLastInteraction = new Map(); // userId -> { timestamp: number, channelId: string }
const processingMessages = new Set(); // messageId -> true (mensagens sendo processadas)
const sendingMessages = new Set(); // messageId -> true (mensagens sendo enviadas)
const COOLDOWN_TIME = 13000; // 13 segundos entre respostas no mesmo canal
const SAME_RESPONSE_COOLDOWN = 30000; // 30 segundos para mesma resposta
const USER_COOLDOWN = 5000; // 5 segundos entre interações com mesmo usuário

// Função para verificar se pode responder (anti-spam)
function canRespond(channelId, newResponse, messageAuthor) {
    const now = Date.now();
    const channelData = lastResponses.get(channelId);
    const userData = userLastInteraction.get(messageAuthor);
    
    console.log(`🔍 Verificando se pode responder no canal ${channelId} para usuário ${messageAuthor}:`);
    console.log(`   - Última resposta: "${channelData?.lastResponse || 'Nenhuma'}"`);
    console.log(`   - Nova resposta: "${newResponse}"`);
    console.log(`   - Timestamp canal: ${channelData?.timestamp || 'N/A'} (${now - (channelData?.timestamp || 0)}ms atrás)`);
    console.log(`   - Última interação usuário: ${userData?.timestamp || 'N/A'} (${now - (userData?.timestamp || 0)}ms atrás)`);
    
    // Verificar cooldown do usuário
    if (userData && userData.channelId === channelId && now - userData.timestamp < USER_COOLDOWN) {
        console.log(`❌ Cooldown ativo para usuário ${messageAuthor} - BLOQUEADO`);
        return false;
    }
    
    // Verificar cooldown do canal
    if (channelData && now - channelData.timestamp < COOLDOWN_TIME) {
        console.log(`❌ Cooldown ativo no canal ${channelId} - BLOQUEADO`);
        return false;
    }
    
    // Verificar se é a mesma resposta recente
    if (channelData && channelData.lastResponse === newResponse && now - channelData.timestamp < SAME_RESPONSE_COOLDOWN) {
        console.log(`❌ Mesma resposta muito recente no canal ${channelId} - BLOQUEADO`);
        return false;
    }
    
    console.log(`✅ Pode responder no canal ${channelId} - PERMITIDO`);
    return true;
}

// Função para registrar resposta
function registerResponse(channelId, response, userId) {
    const timestamp = Date.now();
    
    lastResponses.set(channelId, {
        lastResponse: response,
        timestamp: timestamp,
        lastUser: userId
    });
    
    userLastInteraction.set(userId, {
        timestamp: timestamp,
        channelId: channelId
    });
}

// Evento quando o bot está pronto
client.once(Events.ClientReady, readyClient => {
    console.log(`🤖 Bot agressivo ${readyClient.user.tag} está online e pronto para xingar!`);
    console.log(`🔥 Bot está em ${client.guilds.cache.size} servidores`);
});

// Evento de mensagem
client.on(Events.MessageCreate, async (message) => {
    // Ignorar mensagens do próprio bot
    if (message.author.bot) return;
    
    // Verificar se a mensagem já está sendo processada
    if (processingMessages.has(message.id)) {
        console.log(`⏭️ Mensagem ${message.id} já está sendo processada, ignorando...`);
        return;
    }
    
    // Marcar mensagem como sendo processada
    processingMessages.add(message.id);
    
    console.log(`📨 Mensagem recebida: "${message.content}" de ${message.author.username} em #${message.channel.name}`);

    // =============== COMANDO DE LIMPEZA ===============
    if (clearMessagesService.isClearCommand(message)) {
        console.log(`🧹 Comando de limpeza detectado de ${message.author.username}`);
        await clearMessagesService.handleClearCommand(message);
        processingMessages.delete(message.id);
        return;
    }

    const botUserId = client.user.id;
    const botMention = `<@${botUserId}>`;
    const botNicknameMention = `<@!${botUserId}>`;

    try {
        // =============== CAMINHO 1: MENSAGEM É UMA MENÇÃO ===============
        if (message.content.includes(botMention) || message.content.includes(botNicknameMention)) {
            console.log(`🎯 Bot foi mencionado por ${message.author.username}!`);
            
            const response = await aiService.generateResponse(message.content, true, message.author.id);
            
            if (canRespond(message.channel.id, response, message.author.id)) {
                // Verificar se já está enviando resposta para esta mensagem
                if (sendingMessages.has(message.id)) {
                    console.log(`⚠️ Mensagem ${message.id} já está sendo enviada, ignorando...`);
                    return;
                }
                
                // Marcar como sendo enviada
                sendingMessages.add(message.id);
                
                registerResponse(message.channel.id, response, message.author.id);
                setTimeout(() => {
                    console.log(`📤 Enviando resposta para menção: "${response}"`);
                    message.reply(response).then(() => {
                        console.log(`✅ Resposta enviada com sucesso para menção`);
                        // Limpar flag após envio bem-sucedido
                        sendingMessages.delete(message.id);
                    }).catch(error => {
                        console.error('❌ Erro ao enviar mensagem:', error.message);
                        // Limpar flag mesmo em caso de erro
                        sendingMessages.delete(message.id);
                    });
                }, Math.random() * 2000 + 500);
            } else {
                console.log(`⏳ Cooldown ativo no canal ${message.channel.id}, ignorando resposta`);
            }
        
        // =============== CAMINHO 2: MENSAGEM NÃO É MENÇÃO, TENTA A SORTE ===============
        } else if (Math.random() < 0.45) { // 45% de chance
            console.log(`🎯 Chance aleatória atingida! Gerando resposta...`);
            
            const response = await aiService.generateResponse(message.content, false, message.author.id);

            if (canRespond(message.channel.id, response, message.author.id)) {
                // Verificar se já está enviando resposta para esta mensagem
                if (sendingMessages.has(message.id)) {
                    console.log(`⚠️ Mensagem ${message.id} já está sendo enviada, ignorando...`);
                    return;
                }
                
                // Marcar como sendo enviada
                sendingMessages.add(message.id);
                
                registerResponse(message.channel.id, response, message.author.id);
                setTimeout(() => {
                    message.reply(response).then(() => {
                        // Limpar flag após envio bem-sucedido
                        sendingMessages.delete(message.id);
                    }).catch(error => {
                        console.error('❌ Erro ao enviar mensagem:', error.message);
                        // Limpar flag mesmo em caso de erro
                        sendingMessages.delete(message.id);
                    });
                }, Math.random() * 3000 + 1000);
            } else {
                console.log(`⏳ Cooldown ativo no canal ${message.channel.id}, ignorando resposta aleatória`);
            }
        
        // =============== CAMINHO 3: NÃO É MENÇÃO E NÃO DEU SORTE ===============
        } else {
            console.log(`⏭️ Chance aleatória não atingida, ignorando mensagem`);
        }
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error.message);
    } finally {
        // Limpar flag de processamento em todos os casos
        processingMessages.delete(message.id);
    }
});

// Fazer login do bot
client.login(process.env.DISCORD_TOKEN);