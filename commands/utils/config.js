const roles = require('../../config/roles'),
    moment = require('moment'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length == 0) {
        return this.run(bot, message, ['help']);
    }

    const cmd = args[0].toLowerCase();

    switch (cmd) {
        case 'help':
            (() => {
                bot.respondPm(message, 'Hilfe fehlt noch...')
                message.delete();
            })();
            break;
        case 'emotes':
            (() => {
                if (args.length < 3) {
                    return this.run(bot, message, ['help']);
                }

                const option = args[1].toLowerCase();
                const emote = args[2];

                switch (option) {
                    case 'add':
                        (() => {
                            bot.r.table('emotes').get(args[2]).run().then(result => {
                                if(result == null) {
                                    bot.r.table('emotes').insert({
                                        'id': emote
                                    }).run().then(result => {
                                        if (result.errors > 0) {
                                            bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', true);
                                            bot.log(`Could not insert new emote "${emote}" into db:\n${result.first_error}`);
                                        } else {
                                            bot.respond(message, `Das Emote \`${emote}\` zur Datenbank hinzugefügt.`, true);
                                            bot.log(`Added new emote "${emote}" to db.`);

                                            bot.loadEmotes();
                                        }
                                    }).error(error => {
                                        bot.log(`Could not insert new emote "${emote}" into db:\n${result.first_error}`);
                                    });
                                } else {
                                    bot.respond(message, `Das Emote \`${emote}\` existiert bereits.`, true);
                                }
                            }, error => {
                                bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', true);
                                bot.log(`Could not get user stats db:\n${error}`);
                            });
                        })();
                        break;
                    case 'del':
                        (() => {
                            bot.respondPm(message, 'Del Command fehlt noch')
                            message.delete();
                        })();
                        break;
                    default:
                        (() => {
                            return this.run(bot, message, ['help']);
                        })();
                        break;
                }

            })();
            break;
        default:
            (() => {
                return this.run(bot, message, ['help']);
            })();
            break;
    }
};

exports.config = {
    aliases: ['conf', 'c'],
    server: true,
    role: roles.admin,
};

exports.help = {
    name: 'config',
    description: 'Bearbeiten der Konfiguration. Alle Möglichkeiten unter `!config help`.',
    usage: ['!config', '!c help', '!e emotes add :3']
};