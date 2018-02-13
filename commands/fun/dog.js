const roles = require('../../config/roles'),
    unirest = require('unirest');

exports.run = (bot, message, args) => {
    unirest.get('https://random.dog/woof.json')
        .end((result) => {
            if (result.error || typeof result.body !== 'object') {
                bot.log(result.error, result.body);
                return bot.respond(message, `RandomDog Anfrage fehlgeschlagen (HTTP ${result.status})`);
            }

            const data = result.body;

            if(data.url.includes('.mp4')) {
                this.run(bot,message,args);
                return;
            }

            bot.respond(message, `Wuff :dog: ${data.url}`, true);
        });

};

exports.config = {
    cooldown: 600,
    skip: roles.moderator,
    aliases: ['d']
};


exports.help = {
    name: 'dog',
    description: 'Postet ein zufälliges Hundebild.',
    usage: ['!dog']
};