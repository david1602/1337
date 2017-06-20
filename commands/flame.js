const {getRandomOfArray} = require('../utils');

// Registers the flame command
module.exports = (bot, ctx) => {
    bot.onText(/\/flame (.*)/, (msg, match) => {
        const chatId = msg.chat.id;
        const usr = ctx.users.find(u => u.name === match[1]);

        if (!usr) {
            bot.sendMessage(chatId, 'Who is that?');
            return;
        }

        const flame = getRandomOfArray(ctx.flames.filter(f => f.user_id === usr.id || f.user_id === null));
        if (!flame)
          bot.sendMessage(chatId, 'I don\'t even know how to flame you, I haven\'t been taught any flames.');
        else
          bot.sendMessage(chatId, flame.content);
    });
}
