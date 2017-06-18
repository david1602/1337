// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/listResponses/, (msg) => {
        const chatId = msg.chat.id;
        const {responses} = ctx;

        if (responses.length === 0) {
            bot.sendMessage(chatId, 'I don\'t respond to anything yet. Feel free to teach me something. Learn more via the /help command.');
            return;
        }

        const chatmsg = responses.map(resp => `[ID: ${resp.id} | regex: /${resp.regex}/ | response: "${resp.response}"]`).join('\n');
        bot.sendMessage(chatId, chatmsg);
     });
};
