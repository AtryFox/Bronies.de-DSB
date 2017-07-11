const roles = require('../../config/roles'),
    unirest = require('unirest');

exports.run = (bot, message, args) => {
    unirest.get('http://random.cat/meow')
        .end((result) => {
            if (result.error || typeof result.body !== 'object') {
                bot.log(result.error, result.body);
                return bot.respond(message, 'RandomCat Anfrage fehlgeschlagen (HTTP ' + result.status + ')');
            }

            const data = result.body;

            bot.respond(message, 'Meow :cat: ' + data.file, true);
        });

};

exports.config = {
    cooldown: 300,
    skip: roles.moderator,
    aliases: ['c']
};


exports.help = {
    name: 'cat',
    description: 'Postet ein zufälliges Katzenbild.',
    usage: ['!cat']
};