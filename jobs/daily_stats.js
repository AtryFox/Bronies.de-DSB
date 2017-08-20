const moment = require('moment'),
    Discord = require('discord.js');

moment.locale('de');

exports.run = (bot) => {
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
                    embed.addField('Durchschnitt', 'Kann nicht berechnet werden');
                } else {
                    results = results[0];
                    const messages = Math.round(results.MESSAGES * 100) / 100;
                    const commands = Math.round(results.COMMANDS * 100) / 100;

                    const messagesString = messages == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = commands == 1 ? 'Befehl' : 'Befehle';

                    embed.addField('Durchschnitt', `${messages} ${messagesString} pro Tag und ${commands} ${commandsString} pro Tag.`);

                    bot.server.channels.get(bot.config.BOT_CH).send({embed});
                }
            });
        }

        getStatsYesterday();
    })
};

exports.config = {
    name: 'stats',
    schedule: '2 0 * * *',
    enabled: true
};