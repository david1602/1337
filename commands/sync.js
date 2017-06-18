const {init} = require('../utils');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/sync/, (msg) => {
         const chatId = msg.chat.id;
         const prev = Date.now();
         // Don't pass the bot because we don't want to re-register all listeners
         return init(null, ctx)
            .then( () => bot.sendMessage(chatId, `Synced. Took ${Date.now() - prev} ms.`) );
     });
};
