const fs = require('fs');
const db = require('db');

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
    }
}
