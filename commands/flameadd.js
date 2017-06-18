const {create, getAll} = require('../db').flames;
const {errHandler} = require('../utils');

// Registers the flameadd command
 module.exports = (bot, ctx) => {
     bot.onText(/\/flameadd (.*)/, (msg, match) => {
         const chatId = msg.chat.id;
         const params = match[1]; // the captured "whatever"

         const userMatch = match[1].match(/\[(.+)\] (.*)/);

         const flame = {
             person: null,
             flame: ''
         };

         if (userMatch) {
             flame.person = userMatch[1];
             flame.flame = userMatch[2];
         }
         else
            flame.flame = match[1];

        if (flame.person && !ctx.users.find(usr => usr.name === flame.person)) {
            bot.sendMessage(chatId, `Who is ${flame.person}?`)
            return;
        }

        return create(flame.person, flame.flame)
            .then( () => {
                const forPerson = flame.person ? ` for ${flame.person}` : '';
                const resp = `Added flame "${flame.flame}"${forPerson}.`
                bot.sendMessage(chatId, resp);
                return getAll().then( flames => {ctx.flames = flames;});
            })
            .catch(err => {
                errHandler(err);
                bot.sendMessage(chatId, 'Failed to add flame, see the logs for more detail.')
            })

     });
 }
