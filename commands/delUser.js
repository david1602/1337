const {del} = require('../db').users;
const {errHandler} = require('../utils');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/delUser \[.+\]/, (msg, match) => {
         return del(match[1])
            .then(res => bot.sendMessage(msg.chat.id, res));
     });
};
