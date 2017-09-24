// Registers the say command
module.exports = bot => {
    bot.onText(/\/say ([.\s\S]+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const resp = match[1];
        bot.sendMessage(chatId, resp);
    });
};
