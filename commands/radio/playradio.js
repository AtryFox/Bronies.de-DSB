const roles = require('../../config/roles'),
    exec = require('child_process').exec,
    fs = require('fs');

exports.run = (bot, message, args) => {
    bot.log(`${this.help.name}: Stream restarted by ${message.author.tag}`);

    fs.access(bot.config.RADIO_START, fs.constants.R_OK, (err) => {
        if (!err) {
            try{
                bot.respond(message, 'Radio wird neugestartet...', true);

                exec(bot.config.RADIO_START, (error) => {
                    if(error != null) {
                        bot.respond(message, 'beim Neustarten des Radios ist ein Fehler aufgetreten!', true);
                        bot.log('Failed executing radio start.sh! ' + err);
                    }
                });
            } catch (err) {
                bot.respond(message, 'beim Neustarten des Radios ist ein Fehler aufgetreten!', true);
                bot.log('Failed to execute radio start.sh! ' + err);
            }
        } else {
            bot.respond(message, 'beim Neustarten des Radios ist ein Fehler aufgetreten!', true);
            bot.log('Radio start.sh not found! ' + err);
        }
    });
};

exports.config = {
    aliases: ['pr'],
    cooldown: 60,
    skip: roles.moderator
};

exports.help = {
    name: 'playradio',
    description: 'Startet den Radiostream neu.',
    usage: ['!playradio']
};