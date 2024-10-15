const axios = require('axios');

module.exports = {
    config: {
        name: "brainshop",
        aliases: ["bs", "brain", "brainai"],
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "ai",
        description: "Interact with AI for chat responses.",
        usage: "airesponse <question>",
    },

    onStart: async function ({ bot, args, chatId, msg }) {
        // Check if a question is provided
        if (!args[0]) {
            return bot.sendMessage(chatId, `⚠️ Please provide a prompt.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        const question = args.join(" ");
        const userId = msg.from.id; // User ID from the message
        const brainshopAPI = `http://api.brainshop.ai/get?bid=183376&key=479BdIBlyL030Yne&uid=[${userId}]&msg=${encodeURIComponent(question)}`;
        const perplexityAPI = `https://v2-guru-indratensei.cloud.okteto.net/perplexity?query=${encodeURIComponent(question)}`;

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "💭 | Thinking...", { replyToMessage: msg.message_id });

        try {
            // First try Brainshop API
            let response = await axios.get(brainshopAPI);

            // If Brainshop fails, try Perplexity API
            if (!response.data.cnt) {
                response = await axios.get(perplexityAPI);
            }

            // Check if the response has a valid reply
            if (response.data && (response.data.cnt || response.data.result)) {
                const reply = response.data.cnt || response.data.result;

                // Send the AI response
                await bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    `AI Response:\n\`\`\`\n${reply}\n\`\`\``,
                    { parseMode: 'Markdown', replyToMessage: msg.message_id }
                );
            } else {
                await bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    '⚠️ Unable to get a valid response. Please try again later.',
                    { replyToMessage: msg.message_id }
                );
            }
        } catch (error) {
            console.error("AI Response Error:", error);
            await bot.editMessageText(
                { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                '⚠️ Failed to process the question. Please try again later.',
                { replyToMessage: msg.message_id }
            );
        }
    }
};
