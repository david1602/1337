const db = require('../db');

module.exports = bot => {
    bot.onText(/\/stats/, (msg, match) => {
      const chatId = msg.chat.id;
      return db.stats.getStatistics().then(msg => {
          bot.sendMessage(chatId, msg);
      });
    });
}
