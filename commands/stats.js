const db = require('../db');
const utils = require('../utils');
const Canvas = require('canvas');

module.exports = bot => {
    bot.onText(/\/stats/, msg => {
        const chatId = msg.chat.id;

        return db.stats.getStatistics().then(results => {
            const c = new Canvas();
            const ctx = c.getContext('2d');
            ctx.font = '60px Arial';
            ctx.fillStyle = '#41aff4';

            const buf = utils.renderTable(
                {
                    name: 'Name',
                    amountposts: 'Amount Posts',
                    maxstreak: 'Max Streak',
                    streak: 'Current Streak'
                },
                results,
                ctx
            );

            return bot.sendPhoto(chatId, buf, {
                caption: 'Current stats until today'
            });
        });
    });
};
