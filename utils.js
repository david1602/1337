const fs = require('fs');
const db = require('db');
const moment = require('moment');

module.exports = {
    getRandom(min = 0, max = 999) {
        return Math.floor( Math.random() * (max - min + 1) + min );
    },

    errHandler(err) {
        fs.appendFileSync('err.log', err);
    },

    init(ctx) {
        return Promise.all([
            db.flames.getAll(),
            db.stats.getAll(),
            db.users.getAll()
        ])
        .then( ([flames, stats, users]) => {
            ctx.users = users;
            ctx.stats = stats;
            ctx.flames = flames;
        });
    },

    getRandomOfArray(arr) {
        return arr[this.getRandom(0, arr.length - 1)];
    },

    getTime(date) {
        return moment.tz(moment(date && date * 1000), 'Europe/Berlin').format('HH:mm');
    }
}
