const axios = require('axios');

module.exports = {
    config: {
        name: "cf",
        aliases: ["cloudflare", "cai"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "ai",
        description: "Interact with Cloudflare AI models.",
        usage: "/cf <query> [--modelNumber]",
    },

    onStart: async function ({ bot, args, chatId, msg }) {
        const models = [
            "@hf/google/gemma-7b-it",
            "@cf/meta/llama-2-7b-chat-fp16",
            "@cf/mistral/mistral-7b-instruct-v0.1",
            "@hf/thebloke/deepseek-coder-6.7b-base-awq",
            "@hf/thebloke/deepseek-coder-6.7b-instruct-awq",
            "@cf/deepseek-ai/deepseek-math-7b-base",
            "@cf/deepseek-ai/deepseek-math-7b-instruct",
            "@cf/thebloke/discolm-german-7b-v1-awq",
            "@cf/tiiuae/falcon-7b-instruct",
            "@cf/google/gemma-2b-it-lora",
            "@cf/google/gemma-7b-it-lora",
            "@hf/nousresearch/hermes-2-pro-mistral-7b",
            "@hf/thebloke/llama-2-13b-chat-awq",
            "@cf/meta-llama/llama-2-7b-chat-hf-lora",
            "@cf/meta/llama-3-8b-instruct",
            "@cf/meta/llama-3-8b-instruct-awq",
            "@hf/thebloke/llamaguard-7b-awq",
            "@hf/thebloke/mistral-7b-instruct-v0.1-awq",
            "@cf/mistral/mistral-7b-instruct-v0.2-lora",
            "@hf/thebloke/neural-chat-7b-v3-1-awq",
            "@cf/openchat/openchat-3.5-0106",
            "@hf/thebloke/openhermes-2.5-mistral-7b-awq",
            "@cf/microsoft/phi-2",
            "@cf/qwen/qwen1.5-0.5b-chat",
            "@cf/qwen/qwen1.5-1.8b-chat",
            "@cf/qwen/qwen1.5-14b-chat-awq",
            "@cf/qwen/qwen1.5-7b-chat-awq",
            "@cf/defog/sqlcoder-7b-2",
            "@hf/nexusflow/starling-lm-7b-beta",
            "@cf/tinyllama/tinyllama-1.1b-chat-v1.0",
            "@cf/fblgit/una-cybertron-7b-v2-bf16",
            "@hf/thebloke/zephyr-7b-beta-awq"
        ];

        // Check if a question is provided
        if (!args[0]) {
            return bot.sendMessage(chatId, `⚠️ Please provide a query.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        // Separate query and model argument if provided
        const modelArg = args[args.length - 1].startsWith("--") ? args.pop().slice(2) : "1";
        const query = args.join(" ");
        const modelIndex = parseInt(modelArg) - 1;

        // Validate model index
        const model = models[modelIndex] || models[0];

        const apiUrl = `https://echavie3.nethprojects.workers.dev/ai?model=${model}&q=${encodeURIComponent(query)}`;

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "💭 | Processing your request...", { replyToMessage: msg.message_id });

        try {
            // Request Cloudflare AI Worker API
            const response = await axios.get(apiUrl);

            // Check if the response has a valid reply
            if (response.data && response.data.result) {
                const reply = response.data.result;

                // Send the AI response
                await bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    `CAI:\n\`\`\`\n${reply}\n\`\`\``,
                    { parseMode: 'Markdown', replyToMessage: msg.message_id }
                );
            } else {
                await bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    '⚠️ No valid response from the AI model. Please try again later.',
                    { replyToMessage: msg.message_id }
                );
            }
        } catch (error) {
            console.error("CF AI Error:", error);
            await bot.editMessageText(
                { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                '⚠️ Failed to process the request. Please try again later.',
                { replyToMessage: msg.message_id }
            );
        }
    }
};
