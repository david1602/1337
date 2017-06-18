module.exports = bot => {
    bot.onText(/\/coal/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Burn the coal, pay the toll.');
    });
}
