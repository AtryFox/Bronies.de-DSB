const roles = require('../../config/roles'),
    moment = require('moment'),
    Discord = require('discord.js');

moment.locale('de');

exports.run = (bot, message, args) => {
    function respondError() {
        return bot.respond(message, `Datenbankabfrage fehlgeschlagen, die Protokolle könnten mehr Infos enthalten. (${bot.admin})`, true);
    }

    let embed = new Discord.RichEmbed({
        author: {
            name: bot.server.name,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        title: `Statistiken:`,
        color: 0x243870
    });

    const table = 'stats';
    const now = moment();

    bot.r.table(table).get(bot.momentToReDate(now)).run().then(result => {
        if (result == null) {
            embed.setDescription('Heute wurden noch keine Nachrichten gesendet oder Befehle verwendet.');
        } else {
            const messagesString = result.messages == 1 ? 'Nachricht' : 'Nachrichten';
            const commandsString = result.commands == 1 ? 'Befehl' : 'Befehle';

            embed.setDescription(`Heute wurden bereits **${result.messages} ${messagesString}** gesendet und **${result.commands} ${commandsString}** verwendet.`);
        }

        bot.r.table(table).get(bot.momentToReDate(now.subtract(1, 'days'))).run().then(result => {
            if (result == null) {
                embed.addField('Gestern:', 'Keine Nachrichten gesendet oder Befehle verwendet.');
            } else {
                const messagesString = result.messages == 1 ? 'Nachricht' : 'Nachrichten';
                const commandsString = result.commands == 1 ? 'Befehl' : 'Befehle';

                embed.addField('Gestern:', `${result.messages} ${messagesString} gesendet, ${result.commands} ${commandsString} verwendet.`);
            }

            bot.r.table(table).avg('messages').run().then(result => {
                const messages = Math.round(result * 100) / 100;

                bot.r.table(table).avg('commands').run().then(result => {
                    const commands = Math.round(result * 100) / 100;

                    if (result != null) {
                        const messagesString = messages == 1 ? 'Nachricht' : 'Nachrichten';
                        const commandsString = commands == 1 ? 'Befehl' : 'Befehle';

                        embed.addField('Durchschnitt:', `${messages} ${messagesString} pro Tag, ${commands} ${commandsString} pro Tag.`);
                    }

                    message.channel.sendEmbed(embed);
                }).error(error => {
                    bot.log('Could not get date in db: ' + error);
                    return respondError();
                });
            }).error(error => {
                bot.log('Could not get date in db: ' + error);
                return respondError();
            });
        }).error(error => {
            bot.log('Could not get date in db: ' + error);
            return respondError();
        });
    }).error(error => {
        bot.log('Could not get date in db: ' + error);
        return respondError();
    });

};

exports.config = {
    aliases: ['st'],
    server: true,
    role: roles.community,
    cooldown: 60,
    skip: roles.moderator
};

exports.help = {
    name: 'stats',
    description: 'Zeigt Statistiken zum Server an.',
    usage: ['!stats']
};