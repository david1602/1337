const {sendList} = require('../utils');

// Registers the flameList command
module.exports = (bot, ctx) => {
    bot.onText(/\/flameList/, (msg, match) => {
        const {flames} = ctx;
        const chatId = msg.chat.id;

        if (flames.length === 0) {
            bot.sendMessage(chatId, `I don't know any flames.`);
            return;
        }


        const userObj = ctx.users.reduce( (p, c) => {
            p[c.id] = c;
            return p;
        }, {});

        const formattedRows = flames.map(flame => {
            const usr = flame.user_id ? userObj[flame.user_id].name : 'everyone'
            return `[ID: ${flame.id} |Flame: "${flame.content}" | for: "${usr}"]`;
        });

        return sendList(bot, chatId, formattedRows);
    });
}
