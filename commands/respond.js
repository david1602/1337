const {create, getAll} = require('../db').responses;
const {registerRegex, errHandler} = require('../utils');

// Registers the flameadd command
module.exports = (bot, ctx) => {
     bot.onText(/\/respond \/(.+)\/ \[([.\s\S]*)\]/, (msg, match) => {
         const chatId = msg.chat.id;
         const regex = match[1];
         const response = match[2];
         const isFile = !! msg.caption;

         if (!response && !isFile) {
             bot.sendMessage(chatId, 'You didn\'t specify a response.').
             return;
         }

         try {
             new RegExp(regex, "gi");

             const exists = !! ctx.responses.find(r => r.regex === regex);

             if (exists) {
                 bot.sendMessage(chatId, 'I already respond to that.');
                 return;
             }

             if (isFile && response) {
                 bot.sendMessage(chatId, 'You can\'t specify a response if you send a file.');
                 return;
             }

             return create(regex, response)
                .then( () => getAll() )
                .then( responses => {
                    ctx.responses = responses;
                    registerRegex(bot, regex, response, 'Message');
                    bot.sendMessage(chatId, 'Your regex was added.');
                })
                .catch( err => {
                    errHandler(err);
                    bot.sendMessage(chatId, 'Failed to write to the database');
                });
         }
         catch(e) {
             console.log(e);
             bot.sendMessage(chatId, 'You didn\'t specify a proper regex. It could not be parsed.')
             return;
         }
     });

     ['Video', 'Audio'].forEach( type => {
         bot.onText(new RegExp(`\\/respond \\/(.+)\\/ \\$${type.toLowerCase()}`), (msg, match) => {
             const chatId = msg.chat.id;
             const regex = match[1];
             const lowerCaseType = type.toLowerCase();
             const isFile = !! msg.caption;
             const isType = !! msg[lowerCaseType];

             if(!isFile) {
                 bot.sendMessage(chatId, 'You have to send a file which contains a caption.');
                 return;
             }

             if(!isType) {
                 bot.sendMessage(chatId, `You have to send a valid ${lowerCaseType} file.`);
                 return;
             }

             const fileId = msg[lowerCaseType].file_id;

             try {
                 new RegExp(regex, "gi");

                 const exists = !! ctx.responses.find(r => r.regex === regex);

                 if (exists) {
                     bot.sendMessage(chatId, 'I already respond to that.');
                     return;
                 }

                 return create(regex, fileId, type)
                    .then( () => getAll() )
                    .then( responses => {
                        ctx.responses = responses;
                        registerRegex(bot, regex, fileId, type);
                        bot.sendMessage(chatId, 'Your regex was added.');
                    })
                    .catch( err => {
                        errHandler(err);
                        bot.sendMessage(chatId, 'Failed to write to the database');
                    });
             }
             catch(e) {
                 console.log(e);
                 bot.sendMessage(chatId, 'You didn\'t specify a proper regex. It could not be parsed.')
                 return;
             }
         });
     } );

     bot.onText(/\/respond \/(.+)\/ \$photo/, (msg, match) => {
         const chatId = msg.chat.id;
         const regex = match[1];
         const isFile = !! msg.caption;
         const isPhoto = !! msg.photo;

         if(!isFile) {
             bot.sendMessage(chatId, 'You have to send a file which contains a caption.');
             return;
         }

         if(!isPhoto) {
             bot.sendMessage(chatId, 'You have to send a valid picture.');
             return;
         }

         const fileId = msg.photo.sort( (a, b) => b.file_size - a.file_size )[0].file_id;

         try {
             new RegExp(regex, "gi");

             const exists = !! ctx.responses.find(r => r.regex === regex);

             if (exists) {
                 bot.sendMessage(chatId, 'I already respond to that.');
                 return;
             }

             return create(regex, fileId, 'Photo')
                .then( () => getAll() )
                .then( responses => {
                    ctx.responses = responses;
                    registerRegex(bot, regex, fileId, 'Photo');
                    bot.sendMessage(chatId, 'Your regex was added.');
                })
                .catch( err => {
                    errHandler(err);
                    bot.sendMessage(chatId, 'Failed to write to the database');
                });
         }
         catch(e) {
             console.log(e);
             bot.sendMessage(chatId, 'You didn\'t specify a proper regex. It could not be parsed.')
             return;
         }
     });

     bot.onText(/\/respond \/(.+)\/ \$gif/, (msg, match) => {
         const chatId = msg.chat.id;
         const regex = match[1];
         const isFile = !! msg.caption;
         const isDocument = !! msg.document;
         const isGif = isDocument && msg.document.mime_type === 'video/mp4'

         if(!isFile) {
             bot.sendMessage(chatId, 'You have to send a file which contains a caption.');
             return;
         }

         if(!isDocument) {
             bot.sendMessage(chatId, 'You have to send a valid document.');
             return;
         }

         if(!isGif) {
             bot.sendMessage(chatId, 'You have to send a valid gif file.');
             return;
         }

         const fileId = msg.document.file_id;

         try {
             new RegExp(regex, "gi");

             const exists = !! ctx.responses.find(r => r.regex === regex);

             if (exists) {
                 bot.sendMessage(chatId, 'I already respond to that.');
                 return;
             }

             return create(regex, fileId, 'Document')
                .then( () => getAll() )
                .then( responses => {
                    ctx.responses = responses;
                    registerRegex(bot, regex, fileId, 'Document');
                    bot.sendMessage(chatId, 'Your regex was added.');
                })
                .catch( err => {
                    errHandler(err);
                    bot.sendMessage(chatId, 'Failed to write to the database');
                });
         }
         catch(e) {
             console.log(e);
             bot.sendMessage(chatId, 'You didn\'t specify a proper regex. It could not be parsed.')
             return;
         }
     });

     bot.onText(/\/respond \/(.+)\/ \$voice/, (msg, match) => {
         const chatId = msg.chat.id;
         const regex = match[1];
         const userId = msg.from.id;
         const fileId = ctx.voiceCache[userId];

         if(!fileId) {
             bot.sendMessage(chatId, 'You have to send a voice recording before calling this command.');
             return;
         }

         try {
             new RegExp(regex, "gi");

             const exists = !! ctx.responses.find(r => r.regex === regex);

             if (exists) {
                 bot.sendMessage(chatId, 'I already respond to that.');
                 return;
             }

             return create(regex, fileId, 'Voice')
                .then( () => getAll() )
                .then( responses => {
                    ctx.responses = responses;
                    registerRegex(bot, regex, fileId, 'Voice');
                    bot.sendMessage(chatId, 'Your regex was added.');
                })
                .catch( err => {
                    errHandler(err);
                    bot.sendMessage(chatId, 'Failed to write to the database');
                });
         }
         catch(e) {
             console.log(e);
             bot.sendMessage(chatId, 'You didn\'t specify a proper regex. It could not be parsed.')
             return;
         }
     });

};
