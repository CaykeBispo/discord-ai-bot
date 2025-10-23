const { Events } = require('discord.js');

class ClearMessagesService {
    constructor() {
        this.COMMAND = 'bbcl';
        this.MESSAGE_LIMIT = 50;
        this.COOLDOWN_TIME = 30000; // 30 segundos de cooldown entre usos
        this.userCooldowns = new Map(); // userId -> timestamp
    }

    // Função para verificar se pode usar o comando (anti-spam)
    canUseCommand(userId) {
        const now = Date.now();
        const lastUse = this.userCooldowns.get(userId);
        
        if (lastUse && now - lastUse < this.COOLDOWN_TIME) {
            const remainingTime = Math.ceil((this.COOLDOWN_TIME - (now - lastUse)) / 1000);
            console.log(`⏳ Usuário ${userId} em cooldown. Tempo restante: ${remainingTime}s`);
            return false;
        }
        
        return true;
    }

    // Função para deletar mensagens do usuário
    async deleteUserMessages(channel, userId, limit = this.MESSAGE_LIMIT) {
        try {
            console.log(`🗑️ Iniciando limpeza de ${limit} mensagens do usuário ${userId} no canal ${channel.id}`);
            
            let deletedCount = 0;
            let lastMessageId = null;
            
            // Buscar mensagens em lotes (Discord limita a 100 por vez)
            while (deletedCount < limit) {
                const remaining = limit - deletedCount;
                const fetchLimit = Math.min(100, remaining);
                
                console.log(`🔍 Buscando ${fetchLimit} mensagens (${deletedCount}/${limit} deletadas)`);
                
                const options = {
                    limit: fetchLimit,
                    before: lastMessageId
                };
                
                const messages = await channel.messages.fetch(options);
                
                if (messages.size === 0) {
                    console.log(`📭 Nenhuma mensagem encontrada. Total deletado: ${deletedCount}`);
                    break;
                }
                
                // Filtrar apenas mensagens do usuário específico
                const userMessages = messages.filter(msg => 
                    msg.author.id === userId && 
                    msg.deletable // Verificar se a mensagem pode ser deletada
                );
                
                if (userMessages.size === 0) {
                    console.log(`📭 Nenhuma mensagem do usuário encontrada neste lote`);
                    // Atualizar lastMessageId para continuar buscando
                    lastMessageId = messages.last()?.id;
                    if (!lastMessageId) break;
                    continue;
                }
                
                console.log(`🎯 Encontradas ${userMessages.size} mensagens do usuário para deletar`);
                
                // Deletar mensagens em lotes de 10 (limite do Discord)
                const messageArray = Array.from(userMessages.values());
                for (let i = 0; i < messageArray.length; i += 10) {
                    const batch = messageArray.slice(i, i + 10);
                    
                    try {
                        await Promise.all(batch.map(msg => msg.delete()));
                        deletedCount += batch.length;
                        console.log(`✅ Lote deletado: ${batch.length} mensagens (Total: ${deletedCount}/${limit})`);
                        
                        // Pequena pausa entre lotes para evitar rate limit
                        if (i + 10 < messageArray.length) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    } catch (error) {
                        console.error(`❌ Erro ao deletar lote:`, error.message);
                        // Continuar mesmo se um lote falhar
                    }
                }
                
                // Atualizar lastMessageId para próxima busca
                lastMessageId = messages.last()?.id;
                if (!lastMessageId) break;
                
                // Pausa entre buscas para evitar rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            console.log(`🎉 Limpeza concluída! Total de mensagens deletadas: ${deletedCount}`);
            return deletedCount;
            
        } catch (error) {
            console.error(`❌ Erro durante limpeza de mensagens:`, error.message);
            throw error;
        }
    }

    // Função principal do comando
    async handleClearCommand(message) {
        const userId = message.author.id;
        const channel = message.channel;
        
        console.log(`🧹 Comando de limpeza detectado de ${message.author.username} (${userId})`);
        
        // Verificar cooldown
        if (!this.canUseCommand(userId)) {
            const lastUse = this.userCooldowns.get(userId);
            const remainingTime = Math.ceil((this.COOLDOWN_TIME - (Date.now() - lastUse)) / 1000);
            
            await message.reply(`⏳ Você pode usar o comando novamente em ${remainingTime} segundos!`);
            return;
        }
        
        // Verificar permissões do bot
        if (!channel.permissionsFor(message.guild.members.me).has('ManageMessages')) {
            await message.reply(`❌ Eu não tenho permissão para deletar mensagens neste canal!`);
            return;
        }
        
        try {
            // Registrar uso do comando
            this.userCooldowns.set(userId, Date.now());
            
            // Enviar mensagem de confirmação
            const confirmMsg = await message.reply(`🧹 **Iniciando limpeza de ${this.MESSAGE_LIMIT} mensagens...**\n⏳ Isso pode levar alguns segundos...`);
            
            // Deletar a mensagem do comando
            try {
                await message.delete();
            } catch (error) {
                console.log(`⚠️ Não foi possível deletar a mensagem do comando: ${error.message}`);
            }
            
            // Executar limpeza
            const deletedCount = await this.deleteUserMessages(channel, userId, this.MESSAGE_LIMIT);
            
            // Atualizar mensagem de confirmação
            await confirmMsg.edit(`✅ **Limpeza concluída!**\n🗑️ **${deletedCount} mensagens deletadas**\n⏰ Cooldown: ${this.COOLDOWN_TIME / 1000} segundos`);
            
            // Deletar mensagem de confirmação após 5 segundos
            setTimeout(async () => {
                try {
                    await confirmMsg.delete();
                } catch (error) {
                    console.log(`⚠️ Não foi possível deletar mensagem de confirmação: ${error.message}`);
                }
            }, 5000);
            
        } catch (error) {
            console.error(`❌ Erro no comando de limpeza:`, error.message);
            try {
                await message.reply(`❌ **Erro durante a limpeza:** ${error.message}`);
            } catch (replyError) {
                console.error(`❌ Erro ao enviar mensagem de erro:`, replyError.message);
            }
        }
    }

    // Verificar se a mensagem é o comando
    isClearCommand(message) {
        return message.content.toLowerCase().trim() === this.COMMAND.toLowerCase();
    }
}

module.exports = ClearMessagesService;
