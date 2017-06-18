const fs = require('fs');
const db = require('db');
const moment = require('moment');

module.exports = {

    /**
     * Gets a random number between two numbers.
     *
     * @param  {Integer} min = 0   Lower limit of random numbers
     * @param  {Integer} max = 999 Upper limit of random numbers
     * @return {Integer}           Random number in the defined frame
     */
    getRandom(min = 0, max = 999) {
        return Math.floor( Math.random() * (max - min + 1) + min );
    },


    /**
     * Error handler for any errors occuring during the bot runtime
     *
     * @param  {type} err description
     * @return {type}     description
     */
    errHandler(err) {
        fs.appendFileSync('err.log', err);
    },


    /**
     * Initializes the context of the bot,
     * manipulating the input object
     *
     * @param  {Object} ctx     Context object
     * @return {Promise}
     */
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


    /**
     * Returns a random value from the given array
     *
     * @param  {Array} arr  Array to pick a value from
     * @return {Mixed}      Value from the array
     */
    getRandomOfArray(arr) {
        return arr[this.getRandom(0, arr.length - 1)];
    },


    /**
     * Gets the time in a certain timezone as HH:mm.
     * Optionally a telegram timestamp (which is in seconds rather than milliseconds) can be passed
     * to base the time on that. Otherwise the current time will be used.
     *
     * @param  {Integer} date   Telegram timestamp
     * @return {String}         HH:mm formatted time
     */
    getTime(date) {
        return moment.tz(moment(date && date * 1000), 'Europe/Berlin').format('HH:mm');
    }
}
