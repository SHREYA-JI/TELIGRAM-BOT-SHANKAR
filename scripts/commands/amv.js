const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    config: {
        name: "amv",
        aliases: ["animevideo"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "media",
        description: "Fetch and send a random anime video.",
        usage: "/amv",
        usePrefix: false,
    },

    onStart: async function ({ bot, chatId, msg }) {
        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "🎥 | Searching for an anime video...", { replyToMessage: msg.message_id });

        try {
            // Fetch a random anime video
            const video = await getAnimeVideo();
            
            // Check if a video was found
            if (!video) {
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, "No anime videos found.", { replyToMessage: msg.message_id });
                return;
            }

            // Prepare the caption
            const caption = `\nHere is your anime video!`;

            // Send the video using its URL and caption
            await bot.sendVideo(chatId, video.source, { caption });

            // Delete the pre-processing message after sending the video
            await bot.deleteMessage(preMessage.chat.id, preMessage.message_id);
        } catch (error) {
            console.error("Anime Video Fetch Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to fetch video. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
};

async function getAnimeVideo() {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    const response = await fetch("https://shortstatusvideos.com/anime-video-status-download/");
    const html = await response.text();
    const $ = cheerio.load(html);
    const videoList = [];
    
    $("a.mks_button.mks_button_small.squared").each((index, element) => {
        const videoUrl = $(element).attr("href");
        videoList.push({
            'source': videoUrl
        });
    });

    if (videoList.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * videoList.length);
    return videoList[randomIndex];
}
