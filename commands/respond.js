const {create} = require('../db').responses;
const {registerRegex} = require('../utils');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/respond \/(.+)\/ \[(.*)\]/, (msg, match) => {
         const chatId = msg.chat.id;
         const regex = match[1];
         const response = match[2];

         if (!response) {
             bot.sendMessage(chatId, 'You didn\'t specify a response.').
             return;
         }

         try {
             const valid = new RegExp(regex);
             return create(regex, response)
                .then( () => {
                    registerRegex(bot, regex, response);
                    bot.sendMessage(chatId, 'Your regex was added.');
                });
         }
         catch(e) {
             bot.sendMessage(chatId, 'You didn\'t specify a proper regex. It could not be parsed.')
             return;
         }
     });
};
