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
            name: `${bot.server.name} - Rekorde`,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        color: 0x31a73b
    }).setFooter(moment().format('LLLL'));

    bot.pool.getConnection((error, con) => {
        if (error) {
            return bot.log(`Could not get connection! ${error}`);
        }

        function getMessagesRecord() {
            con.query('SELECT MESSAGES, DATE FROM daily ORDER BY MESSAGES DESC LIMIT 1', (err, results, fields) => {
                if (error) {
                    err.release();
                    respondError();
                    return bot.log(`Could not get record! ${error}`);
                }

                if (results.length >= 1) {
                    results = results[0];

                    embed.addField(`__Nachrichtenrekord__`, `${moment(results.DATE).format('LL')}: **${results.MESSAGES} Nachrichten**`, false);
                }

                getCommandsRecord();
            });
        }
        function getCommandsRecord() {
            con.query('SELECT COMMANDS, DATE FROM daily ORDER BY COMMANDS DESC LIMIT 1', (err, results, fields) => {
                if (error) {
                    err.release();
                    respondError();
                    return bot.log(`Could not get record! ${error}`);
                }

                if (results.length >= 1) {
                    results = results[0];

                    embed.addField(`__Befehlrekord__`, `${moment(results.DATE).format('LL')}: **${results.COMMANDS} Befehle**`, false);

                    message.channel.send({embed});
                }
            });
        }

        getMessagesRecord();
    })

};

exports.config = {
    aliases: ['rec', 'rekord'],
    server: true,
    trusted: false,
    role: roles.user,
    cooldown: 1200,
    global_cooldown: true,
    skip: roles.moderator
};

exports.help = {
    name: 'record',
    description: 'Zeigt Rekorde des Servers an.',
    usage: ['!record']
};