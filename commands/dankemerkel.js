module.exports = bot => {
    bot.onText(/\/dankemerkel/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'djunkrmjurkl')
    });
}
