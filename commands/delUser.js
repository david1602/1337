const {del} = require('../db').users;
const {errHandler} = require('../utils');
const {ownerid} = require('../config');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/delUser \[(.+)\]/, (msg, match) => {
         if (!ctx.users.find(u => u.name === match[1])) {
             bot.sendMessage(msg.chat.id, 'Who\'s that?');
             return;
         }
         if (ownerid !== msg.from.id) {
             bot.sendMessage(msg.chat.id, 'You are not my owner.');
             return;
         }
         return del(match[1])
            .then(res => bot.sendMessage(msg.chat.id, res));
     });
};
