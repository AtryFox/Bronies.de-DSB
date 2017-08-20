const roles = require('../../config/roles'),
    unirest = require('unirest');


exports.run = (bot, message, args) => {
    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help spoiler`');
    }

    const member = bot.server.members.get(message.author.id);

    bot.log(message.author.tag + ' - Message ID: ' + message.id);

    bot.database.updateUser(message.author, 0, error_ => {
        if (error_) {
            return bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
        }

        bot.pool.getConnection((error, con) => {
            if (error) {
                bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
                return bot.log('Could not get connection! ' + error);
            }


            let data = [message.id, args.join(' '), member.id];

            con.query(`INSERT INTO spoiler (MESSAGE_ID, MESSAGE_DATE, MESSAGE, MEMBER_ID) VALUES (?, NOW(), ?, ?)`, data, (err, results, fields) => {
                con.release();
                if (err) {
                    bot.log('Could not insert spoiler! ' + err);
                    bot.respond(message, 'Spoiler konnte nicht erstellt werden.');
                } else {
                    bot.respond(message, `Nachricht von ${message.author} wurde in Spoiler versteckt. ${bot.config.BASE_URL + '/s/' + message.id}`, false);
                    message.delete();
                }
            });
        });
    });
};

exports.config = {
    aliases: ['s'],
    cooldown: 60,
    skip: roles.moderator,
    server: true
};

exports.help = {
    name: 'spoiler',
    description: 'Speichert die eingegebene Nachricht extern um Spoiler zu neuen Folgen o.ä. zu verstecken.\n\nMit `!spoiler` gesendete Nachrichten können nicht mehr bearbeitet und nur manuell von einem Admin gelöscht werden.',
    usage: ['!spoiler Versteckte Nachricht']
};