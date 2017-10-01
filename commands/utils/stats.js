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
            name: `${bot.server.name} - Statistik`,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        color: 0x243870
    }).setFooter(moment().format('LLLL'));

    bot.pool.getConnection((error, con) => {
        if (error) {
            return bot.log(`Could not get connection! ${error}`);
        }

        function getStatsToday() {
            con.query('SELECT * FROM daily WHERE DATE = CURDATE()', (err, results, fields) => {
                if (error) {
                    err.release();
                    respondError();
                    return bot.log(`Could not get stats! ${error}`);
                }

                if (results.length < 1) {
                    embed.addField('Heute', 'Keine Nachrichten oder Befehle', true);
                } else {
                    results = results[0];
                    const messagesString = results.MESSAGES == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = results.COMMANDS == 1 ? 'Befehl' : 'Befehle';

                    embed.addField(`Heute`, `${results.MESSAGES} ${messagesString} und ${results.COMMANDS} ${commandsString}`, true);
                }

                getStatsYesterday();
            });
        }

        function getStatsYesterday() {
            con.query('SELECT * FROM daily WHERE DATE = DATE_ADD(CURDATE(), INTERVAL -1 DAY)', (err, results, fields) => {
                if (err) {
                    con.release();
                    respondError();
                    return bot.log(`Could not get stats! ${error}`);
                }

                if (results.length < 1) {
                    embed.addField('Gestern', 'Keine Nachrichten oder Befehle.', true);
                } else {
                    results = results[0];
                    const messagesString = results.MESSAGES == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = results.COMMANDS == 1 ? 'Befehl' : 'Befehle';

                    embed.addField('Gestern', `${results.MESSAGES} ${messagesString} und ${results.COMMANDS} ${commandsString}`, true);
                }

                getStatsAverage7();
            });
        }

        function getStatsAverage7() {
            con.query('SELECT AVG(MESSAGES) AS MESSAGES, AVG(COMMANDS) AS COMMANDS FROM `daily` WHERE DATE != CURDATE() AND DATE >= DATE_ADD(CURDATE(), INTERVAL -7 DAY)', (err, results, fields) => {
                if (err) {
                    respondError();
                    return bot.log(`Could not get stats! ${error}`);
                }

                if (results.length < 1) {
                    embed.addField('Durchschnitt (7 Tage)', 'Kann nicht berechnet werden');
                } else {
                    results = results[0];
                    const messages = Math.round(results.MESSAGES * 100) / 100;
                    const commands = Math.round(results.COMMANDS * 100) / 100;

                    const messagesString = messages == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = commands == 1 ? 'Befehl' : 'Befehle';

                    embed.addField('Durchschnitt (7 Tage)', `${messages} ${messagesString} pro Tag und ${commands} ${commandsString} pro Tag.`);
                }

                getStatsAverage30();
            });
        }

        function getStatsAverage30() {
            con.query('SELECT AVG(MESSAGES) AS MESSAGES, AVG(COMMANDS) AS COMMANDS FROM `daily` WHERE DATE != CURDATE() AND DATE >= DATE_ADD(CURDATE(), INTERVAL -30 DAY)', (err, results, fields) => {
                if (err) {
                    respondError();
                    return bot.log(`Could not get stats! ${error}`);
                }

                if (results.length < 1) {
                    embed.addField('Durchschnitt (30 Tage)', 'Kann nicht berechnet werden');
                } else {
                    results = results[0];
                    const messages = Math.round(results.MESSAGES * 100) / 100;
                    const commands = Math.round(results.COMMANDS * 100) / 100;

                    const messagesString = messages == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = commands == 1 ? 'Befehl' : 'Befehle';

                    embed.addField('Durchschnitt (30 Tage)', `${messages} ${messagesString} pro Tag und ${commands} ${commandsString} pro Tag.`);
                }

                getStatsAverage();
            });
        }

        function getStatsAverage() {
            con.query('SELECT AVG(MESSAGES) AS MESSAGES, AVG(COMMANDS) AS COMMANDS FROM `daily` WHERE DATE != CURDATE()', (err, results, fields) => {
                con.release();

                if (err) {
                    respondError();
                    return bot.log(`Could not get stats! ${error}`);
                }

                if (results.length < 1) {
                    embed.addField('Durchschnitt (All Time)', 'Kann nicht berechnet werden');
                } else {
                    results = results[0];
                    const messages = Math.round(results.MESSAGES * 100) / 100;
                    const commands = Math.round(results.COMMANDS * 100) / 100;

                    const messagesString = messages == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = commands == 1 ? 'Befehl' : 'Befehle';

                    embed.addField('Durchschnitt (All Time)', `${messages} ${messagesString} pro Tag und ${commands} ${commandsString} pro Tag.`);

                    message.channel.send({embed});
                }
            });
        }

        getStatsToday();
    })

};

exports.config = {
    aliases: ['st'],
    server: true,
    trusted: false,
    role: roles.user,
    cooldown: 600,
    global_cooldown: true,
    skip: roles.moderator
};

exports.help = {
    name: 'stats',
    description: 'Zeigt Statistiken zum Server an.',
    usage: ['!stats']
};