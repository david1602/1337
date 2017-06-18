const {getAll, del} = require('../db').flames;
const {errHandler} = require('../utils');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/flamedel (.*)/, (msg, match) => {
         return del(match[1])
            .then(res => bot.sendMessage(msg.chat.id, res))
            .then(() => getAll())
            .then(flames => {ctx.flames = flames;});
     });
};
