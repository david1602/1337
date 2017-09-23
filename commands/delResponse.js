const {del, getAll} = require('../db').responses;

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/delResponse (.*)/, (msg, match) => {
         const chatId = msg.chat.id;
         const ID = match[1];
         const {responses} = ctx;
         const response = responses.find(r => r.id === parseInt(ID));

         if (!response) {
             bot.sendMessage(chatId, `I don't know any response with the ID ${ID}.`);
             return;
         }

         // Find the previously registered regex.
         // This has to be done using the internal regex objects
         // because it has to be the same object.
         // removeTextListener will not work with a new regular expression
         // because that seems to be a different object and it requires
         // the initial object reference.
         const prevRegex = bot._textRegexpCallbacks
                            .map(o => o.regexp)
                            .find(r => r.toString() === new RegExp(response.regex, "gi").toString() );

         return del(ID)
            .then( () => getAll() )
            .then( responses => { ctx.responses = responses; })
            .then( () => bot.sendMessage(chatId, `Deleted response #${ID}`))
            .then( () => bot.removeTextListener(prevRegex) );
     });
};
