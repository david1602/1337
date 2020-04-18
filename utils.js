const fs = require('fs');
const db = require('./db');
const moment = require('moment-timezone');
const config = require('./config');
const Canvas = require('canvas');
const timezone = 'Europe/Berlin';

// Actually 4096 but it doesn't hurt to have some backup
const max_msg_length = 3000;

const getHeight = measurement => measurement.emHeightAscent;

const utils = {
    /**
     * Gets a random number between two numbers.
     *
     * @param  {Integer} min = 0   Lower limit of random numbers
     * @param  {Integer} max = 999 Upper limit of random numbers
     * @return {Integer}           Random number in the defined frame
     */
    getRandom(min = 0, max = 999) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },

    /**
     * Error handler for any errors occuring during the bot runtime
     *
     * @param  {type} err description
     * @return {type}     description
     */
    errHandler(err) {
        fs.appendFileSync('err.log', moment().format('YYYY-MM-DD HH:mm'));
        fs.appendFileSync('err.log', err);
        fs.appendFileSync('err.log', '\n');
    },

    /**
     * Initializes the context of the bot,
     * manipulating the input context object
     *
     * @param  {Object} bot     Bot object
     * @param  {Object} ctx     Context object
     * @return {Promise}
     */
    init(bot, ctx) {
        return Promise.all([db.flames.getAll(), db.stats.getAll(), db.users.getAll(), db.responses.getAll()]).then(([flames, stats, users, responses]) => {
            ctx.users = users;
            ctx.stats = stats;
            ctx.flames = flames;
            ctx.responses = responses;
            ctx.voiceCache = {};

            // Only register responses if the bot was passed
            if (bot)
                responses.forEach(resp => {
                    utils.registerRegex(bot, resp.regex, resp.response, resp.type);
                });
        });
    },

    /**
     * Returns a random value from the given array
     *
     * @param  {Array} arr  Array to pick a value from
     * @return {Mixed}      Value from the array
     */
    getRandomOfArray(arr) {
        if (arr.length === 0) return null;
        return arr[utils.getRandom(0, arr.length - 1)];
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
        return moment.tz(moment(date && date * 1000), timezone).format('HH:mm');
    },

    /**
     * Returns the post time in the specified timezone
     *
     * @param  {Moment-like} date = null    optional date to parse as initial value,
     *                                      to get the post time for a different day
     * @return {Moment}                       Moment object with the post time in the appropriate timezone
     */
    getPostTime(date = null) {
        return moment
            .tz(date ? moment(date) : moment(), timezone)
            .hour(13)
            .minute(37)
            .second(0);
    },

    /**
     * Returns the current server time in the configured timezone
     *
     * @return {Moment} moment object with the configured timezone
     */
    getServerTime() {
        return moment.tz(moment(), timezone);
    },

    /**
     * returns a moment date or formatted string
     *
     * @param  {Mixed} date                 Date as moment parseable value
     * @param  {boolean} format = false     Format or not?
     * @return {Object|String}
     */

    getDate(date, format = false) {
        const m = moment.tz(moment(date), timezone);

        if (!format) return m;

        return m.format('YYYY-MM-DD');
    },

    /**
     * Gets the user name from a telegram user object.
     *
     * @param  {Object} user Telegram user object, usually the "from" property of a message
     * @return {String}      Formatted full name of a user
     */
    getUserName(user) {
        const { first_name, last_name } = user;
        return [first_name, last_name].filter(e => !!e).join(' ');
    },

    /**
     * Registers a regular expression / response to a given bot
     *
     * @param  {Object} bot      The bot object
     * @param  {String} regex    Regex as string, as it's parsed
     * @param  {String} response Response the bot is supposed to return
     * @return {Undefined}
     */
    registerRegex(bot, regex, response, type = 'Message') {
        const parsed = new RegExp(regex, 'gi');

        bot.onText(parsed, (msg, matches) => {
            const chatId = msg.chat.id;
            // Go through all the params and replace
            const returnMsg = matches.reduce((prev, curr, idx) => {
                if (idx === 0) return prev;

                const currentRegex = new RegExp(`\\$${idx}`, 'g');
                return prev.replace(currentRegex, matches[idx]);
            }, response);
            bot[`send${type || 'Message'}`](chatId, returnMsg);
        });
    },

    /**
     * Sends a list of preprocessed strings
     * concatted by the separator in separated messages,
     * if the concatted string.length > msg_max_length
     *
     * @param  {type} bot              Bot object to send the message
     * @param  {type} chatId           ID of the chat to push the message to
     * @param  {type} textList         List of preprocessed string entries
     * @param  {type} separator = '\n' Optional separator of array entries
     * @return {Promise<undefinde>}
     */
    sendList(bot, chatId, textList, separator = '\n') {
        // Return a promise for an empty list, too
        if (textList.length === 0) return Promise.resolve();

        const tmp = textList.reduce(
            (p, c, idx) => {
                // Ignore entries that are too long
                if (c.length > max_msg_length) {
                    return p;
                }
                if (p.length + c.length > max_msg_length) {
                    const msg = textList.slice(p.lastIdx, idx).join(separator);
                    p.prom = p.prom.then(() => bot.sendMessage(chatId, msg));
                    p.length = c.length;
                    p.lastIdx = idx;
                } else {
                    p.length = p.length + c.length;
                }
                return p;
            },
            {
                length: 0,
                lastIdx: 0,
                prom: Promise.resolve()
            }
        );

        return tmp.prom.then(() => {
            const msg = textList.slice(tmp.lastIdx, textList.length).join(separator);
            return bot.sendMessage(chatId, msg);
        });
    },

    /**
     * Checks the message to see if the bot should reply
     *
     * @param  {Object} msg     Telegram message object
     * @return {Boolean}
     */
    checkGroup(msg) {
        if (process.env.NODE_ENV === 'development') return true;

        return msg.chat.id === config.chatId || msg.chat.id === config.ownerid;
    },

    /**
     * Renders a table as canvas and returns it as buffer
     *
     * @param  {Object} headers     Header object.
     *                              {key: 'Name'}
     *                              The name is rendered as column header.
     *                              All and only keys of the header object
     *                              will be used to extract information
     *                              from the individual rows.
     *
     * @param  {[Object]} rows      Array of row objects
     * @param  {Object} ctx         Context handle for a canvas,
     *                              is used for the font formatting.
     *                              font and fillStyle are copied over.
     * @return {Buffer}
     */

    renderTable(headers, rows, ctx) {
        // space between individual cells or columns
        const diff = 20;

        const measure = txt => ctx.measureText(txt);

        const columnMaxSizes = Object.keys(headers).reduce((acc, key) => {
            const headerMeasures = measure(headers[key]);
            acc[key] = {
                height: getHeight(headerMeasures),
                width: headerMeasures.width
            };

            rows.forEach(res => {
                const sizes = measure(`${res[key]}`);

                if (acc[key].width < sizes.width) acc[key].width = sizes.width;

                if (acc[key].height < getHeight(sizes)) acc[key].height = getHeight(sizes);
            });

            return acc;
        }, {});

        const lineHeight = Object.keys(columnMaxSizes)
            .map(k => columnMaxSizes[k])
            .reduce((prev, curr) => (prev > curr.height ? prev : curr.height), 0);

        const maxSize = Object.keys(columnMaxSizes).reduce(
            (prev, curr) => {
                const itm = columnMaxSizes[curr];
                prev.width = prev.width + itm.width;
                return prev;
            },
            {
                width: Object.keys(headers).length * diff + diff + diff
            }
        );

        // Set height separately, as this is just a rather simple multiplication
        maxSize.height = (lineHeight + diff) * (rows.length + 1);

        const img = new Canvas(maxSize.width, maxSize.height);
        const c = img.getContext('2d');
        c.font = ctx.font;
        c.fillStyle = ctx.fillStyle;

        // Draw headers
        Object.keys(headers).reduce((x, key) => {
            c.fillText(headers[key], x, columnMaxSizes[key].height);
            // Draw vertical lines
            c.beginPath();
            c.lineTo(x + columnMaxSizes[key].width + diff, 0);
            c.lineTo(x + columnMaxSizes[key].width + diff, maxSize.height);
            c.stroke();
            // Draw the first horizontal line
            c.beginPath();
            c.lineTo(0, lineHeight + diff);
            c.lineTo(maxSize.width, lineHeight + diff);
            c.stroke();
            return x + columnMaxSizes[key].width + diff * 2;
        }, 0);

        // Insert rows
        rows.reduce((y, row) => {
            Object.keys(headers).reduce((x, key) => {
                c.fillText(row[key], x, y);
                return x + columnMaxSizes[key].width + diff * 2;
            }, 0);
            // Draw horizontal line
            c.beginPath();
            c.lineTo(0, y + diff);
            c.lineTo(maxSize.width, y + diff);
            c.stroke();
            return y + lineHeight + diff;
        }, lineHeight * 2 + diff);

        return img.toBuffer();
    },

    /**
     * Returns the buffer for the Canvas
     * for the stat overview
     *
     * @param  {[Object]} results   database results for the getStatistics query
     * @return {Buffer}
     */

    getTableBuffer(results) {
        const c = new Canvas();
        const ctx = c.getContext('2d');
        ctx.font = '60px Arial';
        ctx.fillStyle = '#41aff4';

        const current = utils.getServerTime();
        const target = utils.getPostTime();

        results.forEach(res => {
            const checkDate = current.isBefore(target) ? utils.getDate(moment(target).subtract(1, 'day'), true) : utils.getDate(Date.now(), true);
            if (utils.getDate(res.postdate, true) !== checkDate) res.streak = 0;
        });

        return utils.renderTable(
            {
                name: 'Name',
                amountposts: 'Amount Posts',
                maxstreak: 'Max Streak',
                streak: 'Current Streak'
            },
            results,
            ctx
        );
    }
};

module.exports = utils;
