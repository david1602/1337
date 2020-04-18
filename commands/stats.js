const db = require('../db');
const utils = require('../utils');

module.exports = bot => {
    bot.onText(/\/stats/, msg => {
        const chatId = msg.chat.id;

        return db.stats.getStatistics().then(results => {
            const buf = utils.getTableBuffer(results);

            return bot.sendPhoto(chatId, buf, {
                caption: 'Current stats until today'
            });
        });
    });
};
