// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/help/, (msg, match) => {
         bot.sendMessage(msg.chat.id, `Anything in <> is a user input. The following commands are available:
/say <text>
/stats
/flameadd <flame of any length>
/flameadd [<person name, case sensitive>] <flame of any length>
/flamedel <text>
/say <text of any length>
/respond /<valid regex>/ <response of any length>
/listResponses
/delResponse <ID>
/sync
`);
     });
};
