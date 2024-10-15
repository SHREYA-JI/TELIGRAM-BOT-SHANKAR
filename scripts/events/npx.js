const path = require('path');

// Define command files that should respond without prefix
const COMMAND_FILES = [
    'amv', // command file names without .js extension
    'uid',
    'tid'
];

module.exports = {
    config: {
        name: 'text',
        description: 'Event handler to execute selected commands without prefix'
    },
    onEvent: async ({ bot, msg, threadModel, userModel }) => {
        const chatId = msg.chat.id;
        const userText = msg.text.toLowerCase().trim();

        // Check if the message matches any command file name in COMMAND_FILES
        if (COMMAND_FILES.includes(userText)) {
            try {
                // Load the command module dynamically based on the user's text
                const commandPath = path.resolve(`./scripts/commands/${userText}.js`);
                const commandModule = require(commandPath);

                // Execute the command's `onStart` function, passing necessary context
                if (commandModule.onStart) {
                    await commandModule.onStart({ bot, msg, chatId, threadModel, userModel });
                } else {
                    console.warn(`The command '${userText}.js' does not have an 'onStart' function.`);
                    await bot.sendMessage(chatId, `The command '${userText}' is not configured properly. Please try again later.`);
                }
            } catch (error) {
                console.error(`Error executing command '${userText}':`, error);
                await bot.sendMessage(chatId, `Oops! Failed to process your request. Please try again later.`);
            }
        }
    }
};
