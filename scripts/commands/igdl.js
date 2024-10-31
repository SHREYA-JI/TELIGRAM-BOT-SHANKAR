const axios = require('axios');

module.exports = {
    config: {
        name: "igdl",
        aliases: ["instavid", "downig", "ig", "insta"],
        category: "downloader",
        role: 0,
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        description: "Download Instagram video or image",
        usage: "igdl <video_url>",
    },

    onStart: async function ({ bot, msg, args }) {
        try {
            if (args.length === 0) {
                return bot.sendMessage(msg.chat.id, "No URL provided.", { replyToMessage: msg.message_id });
            }

            const url = args[0];
            const payload = {
                url: url,
                ts: '1729051107066',//Date.now(),
                _ts: '1728986886483',//Date.now() - 100000,
                _tsc: 0,
                _s: 'ed96e31161a2d12f3b4ad060df0b4059e406ee2ad0b749ad800a3e62dea22f2b' // Replace with the appropriate signature
            };

            const downloadMsg = await bot.sendMessage(msg.chat.id, '⏳ Fetching media...', { replyToMessage: msg.message_id });

            const response = await axios.post('https://fastdl.app/api/convert', payload);
            const data = response.data;

            if (data.url && data.url.length > 0) {
                const media = data.url[0];
                const mediaUrl = media.url;
                const mediaType = media.type;
                const fileType = media.ext;
                const title = data.meta.title;
                const username = data.meta.username;
                const commentCount = data.meta.comment_count;
                const likeCount = data.meta.like_count;

                // Define lists of extensions for video and image
                const videoExtensions = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm'];
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff'];

                // Determine the media type by checking the file extension
                if (videoExtensions.includes(fileType)) {
                    await bot.sendVideo(msg.chat.id, mediaUrl, {
                        caption: `🎬 **Title:** ${title}\n👤 **Username:** ${username}\n❤️ **Likes:** ${likeCount}\n💬 **Comments:** ${commentCount}`,
                        replyToMessage: msg.message_id
                    });
                } else if (imageExtensions.includes(fileType)) {
                    await bot.sendPhoto(msg.chat.id, mediaUrl, {
                        caption: `📷 **Title:** ${title}\n👤 **Username:** ${username}\n❤️ **Likes:** ${likeCount}\n💬 **Comments:** ${commentCount}`,
                        replyToMessage: msg.message_id
                    });
                } else {
                    await bot.sendMessage(msg.chat.id, 'Unsupported media type!', { replyToMessage: msg.message_id });
                }

                await bot.deleteMessage(downloadMsg.chat.id, downloadMsg.message_id);
            } else {
                await bot.sendMessage(msg.chat.id, 'No media found! Something went wrong.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error('Error fetching or sending media:', error);
            await bot.sendMessage(msg.chat.id, 'Error fetching or sending media.', { replyToMessage: msg.message_id });
        }
    },
};
