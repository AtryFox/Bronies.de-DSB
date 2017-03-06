const roles = require('../../config/roles'),
    unirest = require('unirest');


exports.run = (bot, message, args) => {
    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help spoiler`');
    }

    const member = bot.server.members.get(message.author.id);

    const url = 'https://s.equestriadev.de/post.php';
    bot.log(message.author.username + '#' + message.author.discriminator + ' - Spoiler: ' + url + ' Message ID: ' + message.id);

    unirest.post(url)
        .header("Accept", "application/json")
        .send({
            message: args.join(' '),
            message_id: message.id,
            user: member.user.username,
            user_discriminator: member.user.discriminator,
            user_id: member.id,
            user_avatar: member.user.displayAvatarURL,
            key: bot.config.SPOILER_KEY
        })
        .end((result) => {
            if (result.error || typeof result.body !== 'object') {
                bot.log(result.error, result.body);
                return bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
            }

            const data = result.body;

            if (data.status == 'success') {
                bot.respond(message, `Nachricht von ${message.author} wurde in Spoiler versteckt. https://s.equestriadev.de/${message.id}`, false);
                message.delete();
            } else {
                bot.log('Could not create spoiler: ' + JSON.stringify(data));
                bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
            }
        });
};

exports.config = {
    aliases: ['s'],
    role: roles.community,
    cooldown: 5,
    skip: roles.moderator,
    server: true
};

exports.help = {
    name: 'spoiler',
    description: 'Speichert die eingegebene Nachricht extern um Spoiler zu neuen Folgen o.ä. zu verstecken.\n\nMit `!spoiler` gesendete Nachrichten können nicht mehr bearbeitet und nur manuell von **@DerAtrox#1257** gelöscht werden.',
    usage: ['!spoiler Versteckte Nachricht']
};