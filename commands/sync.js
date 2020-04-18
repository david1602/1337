const { init } = require('../utils');
const { ownerid } = require('../config');

// Registers the flameadd command
module.exports = (bot, ctx) => {
    bot.onText(/\/sync/, msg => {
        const chatId = msg.chat.id;
        if (ownerid !== msg.from.id) {
            bot.sendMessage(msg.chat.id, 'You are not my owner.');
            return;
        }
        const prev = Date.now();
        // Don't pass the bot because we don't want to re-register all listeners
        return init(null, ctx).then(() =>
            bot.sendMessage(chatId, `Synced. Took ${Date.now() - prev} ms.`)
        );
    });
};
