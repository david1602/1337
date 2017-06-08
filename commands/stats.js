module.exports = bot => {
    bot.onText(/\/stats/, (msg, match) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, renderStats());
    });
}