const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyDbmvQvBvL7IZCqKQ63R8hwN5UtFFVmK64");

// Object to store each user's chat session history
const userSessions = {};

// List of keywords or phrases for resetting the chat
const resetKeywords = [
    "reset", "clear", "new session", "start over", "restart", "clear chat",
    "reset chat", "start fresh", "delete history", "clear history",
    "erase chat", "begin new", "wipe chat", "reboot", "refresh"
];

module.exports = {
    config: {
        name: "gemini",
        aliases: ["geminichat", "bard"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "tools",
        description: "Start an interactive chat session with Gemini AI. Use 'reset' to clear chat history.",
        usage: "/gemini <text>",
    },

    onStart: async function ({ bot, chatId, msg, args }) {
        try {
            const userId = msg.from.id;
            const prompt = args.join(' ').toLowerCase();

            // Check if the prompt contains any of the reset keywords
            if (resetKeywords.some(keyword => prompt.includes(keyword))) {
                userSessions[userId] = { history: [] }; // Clear chat history
                return bot.sendMessage(chatId, "🧹 Chat history cleared! Let's start fresh.", { replyToMessage: msg.message_id });
            }

            if (!prompt) {
                return bot.sendMessage(chatId, "Uh... what do you want to say? 🤔", { replyToMessage: msg.message_id });
            }

            // Initialize the chat session if it doesn’t exist for the user
            if (!userSessions[userId]) {
                userSessions[userId] = {
                    chat: genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).startChat({
                        history: [
                            { role: "user", parts: [{ text: "Hello" }] },
                            { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }] },
                        ],
                    })
                };
            }

            const chat = userSessions[userId].chat;

            // Send a pre-message while processing the AI's response
            const preMessage = await bot.sendMessage(chatId, "🤖 Thinking...", { replyToMessage: msg.message_id });

            // Send the message to the user's chat session
            const result = await chat.sendMessage(prompt);
            const responseText = result.response.text();

            // Edit the pre-message with the AI's actual response
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, responseText);
        } catch (error) {
            console.error("Gemini AI Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, "Oops! Something went wrong. We're working on fixing it ASAP.");
        }
    }
};
