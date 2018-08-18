const roles = require('../../config/roles'),
    unirest = require('unirest');

exports.run = (bot, message, args) => {
    unirest.get('https://randomfox.ca/floof/')
        .end((result) => {
            if (result.error || typeof result.body !== 'object') {
                bot.log(result.error, result.body);
                return bot.respond(message, `RandomFox Anfrage fehlgeschlagen (HTTP ${result.status})`);
            }

            const data = result.body;

            bot.respond(message, `:fox: ${data.image}`, true);
        });

};

exports.config = {
    cooldown: 600,
    skip: roles.moderator,
    aliases: ['d']
};


exports.help = {
    name: 'fox',
    description: 'Postet ein zufälliges Fuxbild.',
    usage: ['!fox']
};