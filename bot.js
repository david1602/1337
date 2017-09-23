const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const {
    init,
    getTime,
    getUserName,
    getRandomOfArray,
    errHandler
} = require('./utils');
const db = require('./db');
const {token} = require('./config');


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const schedule = (fn, duration, param) => setTimeout(fn, duration, param);
const effectiveTime = '13:37';

const ctx = {
    users: [],
    stats: [],
    flames: []
};

// DATE: true/false
const posted = {};

const postStats = chatId => {
    delete posted[moment().format('YYYY-MM-DD')];
    return db.stats.getStatistics().then(msg => {
        bot.sendMessage(chatId, msg);
    });
};

const registerUser = (msg, chatId) => {
    if (!ctx.users.find(usr => usr.id === msg.from.id)) {
        const name = getUserName(msg.from);
        return db.users.create(msg.from.id, name)
        .then( () => Promise.all([
            db.users.getAll(),
            db.stats.getAll()
        ]).then( ([users, stats]) => {
            ctx.users = users;
            ctx.stats = stats;
            bot.sendMessage(chatId, `Nice meeting you, ${name}.`)
        }));
    }

    return Promise.resolve();
}

console.log('Initializing');
// Initialize the cache
init(bot, ctx)
.then( () => {
    console.log('Finished initializing');
    // Register all commands
    fs.readdirSync('./commands')
        .forEach(file => {
            const fn = require(path.resolve('commands', file))
            console.log(`Registering command /${file.replace('.js', '')}`);
            fn(bot, ctx)
        });

    // Listen for any kind of message. There are different kinds of
    // messages.
    console.log('Registering message handler');
    bot.on('message', (msg) => {
      const chatId = msg.chat.id;
      const userName = getUserName(msg.from);
      const currentDate = moment().format('YYYY-MM-DD');

      // Set the posted object for the current day if it's not set yet
      if (!posted[currentDate])
        posted[currentDate] = {};

      // Register any user we don't know yet
      return registerUser(msg, chatId)
      .then( () => {
          const time = getTime(msg.date);
          // send a message to the chat acknowledging receipt of their message
          if (msg.text === '1337' && time === effectiveTime) {
              // Manipulate the state object
              if (!posted[currentDate].scheduled) {
                  schedule(postStats, 70000, chatId);
                  posted[currentDate].scheduled = true;
              }

              if (!posted[currentDate][userName])
                posted[currentDate][userName] = {};

              // If the user posted previously on that very day and failed, he may not correct
              if (posted[currentDate][userName] && 'undefined' === typeof posted[currentDate][userName].success) {
                  posted[currentDate][userName] = {success: true};
                  db.stats.create(userName, currentDate)
              }
          }

          // If someone generally posts 1337 at an unappropriate time, just flame them
          if (msg.text === '1337' && time !== effectiveTime) {
              const flame = getRandomOfArray(ctx.flames.filter(f => f.user_id === msg.from.id || f.user_id === null));
              if (!flame)
                bot.sendMessage(chatId, 'I don\'t even know how to flame you, I haven\'t been taught any flames.');
              else
                bot.sendMessage(chatId, flame.content);
          }

          // If someone fails prior to the time on that day, he may not attmept again
          if (msg.text === '1337' && !posted[currentDate][userName] && time < effectiveTime) {
              posted[currentDate][userName] = {success: false};
              bot.sendMessage(chatId, `You failed today ${userName}. You may not try again.`);
          }
      } )
      .catch(errHandler);
    });
});
