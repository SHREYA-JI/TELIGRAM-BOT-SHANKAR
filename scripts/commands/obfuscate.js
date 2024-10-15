const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

module.exports = {
    config: {
        name: "obfuscate",
        aliases: ["jsobfuscate"],
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "utility",
        description: "Obfuscate your JavaScript code or files.",
        usage: "/obfuscate <JavaScript code> or /obfuscate <filename.js>",
    },

    onStart: async function ({ bot, args, chatId, msg, userId, config }) {
        // Check if any argument is provided
        if (!args.length) {
            return bot.sendMessage(chatId, `⚠️ Please provide JavaScript code or a filename to obfuscate.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        const input = args.join(" ").trim();
        const filePath = path.join(__dirname, input); // Get the full path

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "🔄 | Obfuscating your code...", { replyToMessage: msg.message_id });

        try {
            let obfuscatedCode;
            let outputFileName;

            // Check if the user is the bot owner
            const isOwner = userId === config.owner;

            if (isOwner && fs.existsSync(filePath) && filePath.endsWith('.js')) {
                // It's a file, read and obfuscate the file content
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                obfuscatedCode = JavaScriptObfuscator.obfuscate(fileContent).getObfuscatedCode();
                outputFileName = path.basename(filePath); // Use the original filename for the output
                await bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    `Obfuscated Code from ${input}:\nSending the document now...`,
                    { replyToMessage: msg.message_id }
                );
            } else if (!isOwner) {
                // If the user is not the owner, obfuscate direct code only
                obfuscatedCode = JavaScriptObfuscator.obfuscate(input).getObfuscatedCode();
                outputFileName = 'obfuscated_code.js'; // Use a fixed name for regular users
                await bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    `Obfuscated Code:\nSending the document now...`,
                    { replyToMessage: msg.message_id }
                );
            } else {
                // If owner but not a valid file, inform the user
                return bot.editMessageText(
                    { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                    '⚠️ Invalid filename. Please provide a valid JavaScript (.js) file.',
                    { replyToMessage: msg.message_id }
                );
            }

            // Create a temporary file to save the obfuscated code
            const tempFilePath = path.join(__dirname, outputFileName);
            fs.writeFileSync(tempFilePath, obfuscatedCode);

            // Send the obfuscated code as a document
            await bot.sendDocument(chatId, tempFilePath, { caption: 'Here is your obfuscated code.' });

            // Clean up the temporary file
            fs.unlinkSync(tempFilePath);
        } catch (error) {
            console.error("Obfuscation Error:", error);
            await bot.editMessageText(
                { chatId: preMessage.chat.id, messageId: preMessage.message_id },
                '⚠️ Failed to obfuscate the code. Please try again later.',
                { replyToMessage: msg.message_id }
            );
        }
    }
};
