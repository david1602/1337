const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { init, getUserName, errHandler } = require('./utils');
const db = require('./db');
const { token } = require('./config');
const utils = require('./utils');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

const fn = bot.processUpdate.bind(bot);

process.on('unhandledrejection', reason => {
    console.error('*** Unhandled promise rejection', reason);
    process.exit(1); // Exit to allow for a restart
});

bot.processUpdate = function(update) {
    if (!utils.checkGroup(update.message)) return;
    fn(update);
};

const ctx = {
    users: [],
    stats: [],
    flames: []
};

const registerUser = (msg, chatId) => {
    if (!ctx.users.find(usr => usr.id === msg.from.id)) {
        const name = getUserName(msg.from);
        return db.users.create(msg.from.id, name).then(() =>
            Promise.all([db.users.getAll(), db.stats.getAll()]).then(([users, stats]) => {
                ctx.users = users;
                ctx.stats = stats;
                bot.sendMessage(chatId, `Nice meeting you, ${name}.`);
            })
        );
    }

    return Promise.resolve();
};

console.log('Initializing');
// Initialize the cache
init(bot, ctx).then(() => {
    console.log('Finished initializing');
    // Register all commands
    fs.readdirSync('./commands').forEach(file => {
        const fn = require(path.resolve('commands', file));
        console.log(`Registering command /${file.replace('.js', '')}`);
        fn(bot, ctx);
    });

    // Listen for any kind of message. There are different kinds of
    // messages.
    console.log('Registering message handler');
    bot.on('message', async msg => {
        await db.log(msg);

        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const isVoice = !!msg.voice;

        if (isVoice) ctx.voiceCache[userId] = msg.voice.file_id;

        // Set the posted object for the current day if it's not set yet
        // Register any user we don't know yet
        return registerUser(msg, chatId).catch(errHandler);
    });
});
