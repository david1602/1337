const fs = require('fs');
const db = require('./db');
const moment = require('moment-timezone');
const webshot = require('webshot');

// Actually 4096 but it doesn't hurt to have some backup
const max_msg_length = 3000;

const utils = {

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
        return Promise.all([
            db.flames.getAll(),
            db.stats.getAll(),
            db.users.getAll(),
            db.responses.getAll()
        ])
        .then( ([flames, stats, users, responses]) => {
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
        if (arr.length === 0)
            return null;
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
        return moment.tz(moment(date && date * 1000), 'Europe/Berlin').format('HH:mm');
    },


    /**
     * Gets the user name from a telegram user object.
     *
     * @param  {Object} user Telegram user object, usually the "from" property of a message
     * @return {String}      Formatted full name of a user
     */
    getUserName(user) {
        const {first_name, last_name} = user;
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
            const returnMsg = matches.reduce( (prev, curr, idx) => {
                if (idx === 0)
                    return prev;

                const currentRegex = new RegExp(`\\$${idx}`, 'g');
                return prev.replace(currentRegex, matches[idx]);
            }, response);
            bot[`send${type}`](chatId, returnMsg);
        })
    },


    generateHTMLTable(columns, rows) {
        const columnNames = Object.keys(columns);

        return `<html>
            <style type="text/css">
                td, th{ padding: 5px; }
                td.numeric{ text-align: right; }
            </style>
            <body>
                <table>
                    <tbody>
                        <tr><th>Current stats until today:</th></tr>
                        <tr>${ columnNames.map( col => `<th>${columns[col].title}</th>` ).join('') }</tr>
                        ${ rows.map( row => `<tr>${columnNames.map( col => `<td class="${columns[col].type}">${row[col]}</td>` ).join('')}</tr>` ) }
                    </tbody>
                </table>
            </body>
        </html>`;
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
        if (textList.length === 0)
            return Promise.resolve();

        const tmp = textList.reduce( (p, c, idx) => {
            // Ignore entries that are too long
            if (c.length > max_msg_length) {
                return p;
            }
            if (p.length + c.length > max_msg_length) {
                const msg = textList.slice(p.lastIdx, idx).join(separator);
                p.prom = p.prom.then( () => bot.sendMessage(chatId, msg) );
                p.length = c.length;
                p.lastIdx = idx;
            }
            else {
                p.length = p.length + c.length;
            }
            return p;
        }, {
            length: 0,
            lastIdx: 0,
            prom: Promise.resolve()
        });

        return tmp.prom.then( () => {
            const msg = textList.slice(tmp.lastIdx, textList.length).join(separator);
            return bot.sendMessage(chatId, msg);
        });
    },


    /**
     * Returns a stream of the rendered HTML
     *
     * @param  {string} html HTML to render
     * @return {Stream}      Rendered stream
     */
    screenshotHtml(html) {
        return webshot(html, {siteType: 'html'});
    }
};

module.exports = utils;
