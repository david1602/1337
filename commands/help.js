// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/help/, (msg, match) => {
         bot.sendMessage(msg.chat.id, `Anything in <> is a user input. The following commands are available:
/say <text, including linebreaks>
/stats
/flame <name of person, case sensitive>
/flameadd <flame of any length, including linebreaks>
/flameadd [<person name, case sensitive>] <flame of any length, including linebreaks>
/flamedel <text>
/flameList
/say <text of any length>
/respond /<valid regex>/ [<response of any length, including linebreaks>]
/listResponses
/delResponse <ID>
/delUser [<person name, case sensitive>]
/sync
`);
     });
};
