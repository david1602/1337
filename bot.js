const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const {renderStats} = require('./utils');

const {token, dbConn} = require('./config');

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const schedule = (fn, duration, param) => setTimeout(fn, duration, param);
const effectiveTime = '13:37';

// ID: {first_name last_name counter}
const stats = {};

// DATE: true/false
const posted = {};

// Register all commands
fs.readdirSync('./commands')
    .map(file => require(path.resolve('commands', file)))
    .forEach(fn => fn(bot));

const postStats = chatId => {
    delete posted[moment().format('YYYY-MM-DD')];
    bot.sendMessage(chatId, renderStats(stats));
}

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const {first_name, last_name} = msg.from;
  const text = `${first_name} nope`;

  const time = moment(msg.date*1000).format('HH:mm');
  // send a message to the chat acknowledging receipt of their message
  if (msg.text === '1337' && time === effectiveTime) {
      if (!stats[msg.from.id])
        stats[msg.from.id] = { first_name, last_name, counter: 0};

      stats[msg.from.id].counter = stats[msg.from.id].counter + 1;

      if (!posted[moment().format('YYYY-MM-DD')])
        schedule(postStats, 60000, chatId);
      posted[moment().format('YYYY-MM-DD')] = true;
  }
  if (msg.text === '1337' && time !== effectiveTime) {
      bot.sendMessage(chatId, text);
  }
});

