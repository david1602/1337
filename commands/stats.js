const db = require('../db');
const utils = require('../utils');

module.exports = bot => {
    bot.onText(/\/stats/, msg => {
      const chatId = msg.chat.id;

      return db.stats.getStatistics().then(msg => {
          const html = utils.generateHTMLTable(
              {
                  name: {
                      title: 'Name',
                      type: 'string'
                  },
                  amountposts: {
                      title: 'Amount Posts',
                      type: 'numeric'
                  },
                  maxstreak: {
                      title: 'Max Streak',
                      type: 'numeric'
                  },
                  streak: {
                      title: 'Streak',
                      type: 'numeric'
                  }
              },
              msg
          );

          const renderStream = utils.screenshotHtml(html.html, html.window);

            return utils.convertStreamToBuffer(renderStream).then( buffer => {
              bot.sendPhoto(
                  chatId,
                  buffer,
                  {caption: 'Current stats until today:'}
              );
          });
      } );

    });
}
