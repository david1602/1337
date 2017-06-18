const {del} = require('../db').responses;
const {errHandler} = require('../utils');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/delResponse (.*)/, (msg, match) => {
         const chatId = msg.chat.id;
         const ID = match[1];
         const {responses} = ctx;
         const response = responses.find(r => r.id === parseInt(ID));

         if (!response) {
             bot.sendMessage(`I don't know any response with the ID ${ID}.`);
             return;
         }


         return del(ID)
            .then( () => bot.sendMessage(chatId, `Deleted response #${ID}`))
            .then( () => bot.removeTextListener(new RegExp(response.regex)) );
     });
};
