// Registers the flameadd command
 module.exports = bot => {
     bot.onText(/\/flameadd (.*)/, (msg, match) => {
         const chatId = msg.chat.id;
         const params = match[1]; // the captured "whatever"

         const tokens = params.split(' ');

         const flame = {
             person: null,
             flame: ''
         };

         if (tokens[0].match(/\[.*\]/))
             flame.person = tokens[0].replace('[', '').replace(']', '');

         flame.person ? flame.flame = tokens.slice(1).join(' ') : flame.flame = tokens.join(' ');

         const forPerson = flame.person ? ` for ${flame.person}` : '';
         const resp = `Added flame "${flame.flame}"${forPerson}.`

         // send back the matched "whatever" to the chat
         bot.sendMessage(chatId, resp);
     });
 }