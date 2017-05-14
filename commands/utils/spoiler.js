const roles = require('../../config/roles'),
    unirest = require('unirest');


exports.run = (bot, message, args) => {
    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help spoiler`');
    }

    const member = bot.server.members.get(message.author.id);

    bot.log(message.author.username + '#' + message.author.discriminator + ' - Message ID: ' + message.id);

    bot.pool.getConnection((error, con) => {
        if (error) {
            bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
            return bot.log('Could not get connection! ' + error);
        }


        let data = [args.join(' '), message.id, member.user.username + '#' + member.user.discriminator, member.id, member.user.displayAvatarURL];

        con.query(`INSERT INTO spoiler (MESSAGE, MESSAGE_ID, MESSAGE_DATE, USER, USER_ID, USER_AVATAR) VALUES (?, ?, NOW(), ?, ?, ?)`, data, (err, results, fields) => {
            con.release();
            if (err) {
                bot.log('Could not insert spoiler! ' + err);
                bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
            } else {
                bot.respond(message, `Nachricht von ${message.author} wurde in Spoiler versteckt. https://s.equestriadev.de/${message.id}`, false);
                message.delete();
            }
        });
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