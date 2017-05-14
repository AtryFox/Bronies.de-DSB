const Discord = require('discord.js');

exports.run = (bot) => {
    function respondError() {
        return bot.respond(message, `Datenbankabfrage fehlgeschlagen, die Protokolle könnten mehr Infos enthalten. (${bot.admin})`, true);
    }

    let embed = new Discord.RichEmbed({
        author: {
            name: bot.server.name,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        title: `Aktuelle Statistiken:`,
        color: 0x243870
    });

    bot.pool.getConnection((error, con) => {
        if (error) {
            return bot.log('Could not get connection! ' + error);
        }

        function getStatsYesterday() {
            con.query('SELECT * FROM daily WHERE DATE = DATE_ADD(CURDATE(), INTERVAL -1 DAY)', (err, results, fields) => {
                if (err) {
                    con.release();
                    respondError();
                    return bot.log('Could not get stats! ' + error);
                }

                if (results.length < 1) {
                    embed.setDescription(' Gestern wurden keine Nachrichten gesendet oder Befehle verwendet.');
                } else {
                    results = results[0];
                    const messagesString = results.MESSAGES == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = results.COMMANDS == 1 ? 'Befehl' : 'Befehle';

                    embed.setDescription(`Gestern wurden ${results.MESSAGES} ${messagesString} gesendet und ${results.COMMANDS} ${commandsString} verwendet.`);
                }

                getStatsAverage();
            });
        }

        function getStatsAverage() {
            con.query('SELECT AVG(MESSAGES) AS MESSAGES, AVG(COMMANDS) AS COMMANDS FROM `daily` WHERE DATE != CURDATE()', (err, results, fields) => {
                con.release();

                if (err) {
                    respondError();
                    return bot.log('Could not get stats! ' + error);
                }

                if (results.length < 1) {
                    embed.addField('Gestern:', 'Keine Nachrichten gesendet oder Befehle verwendet.');
                } else {
                    results = results[0];
                    const messages = Math.round(results.MESSAGES * 100) / 100;
                    const commands = Math.round(results.COMMANDS * 100) / 100;

                    const messagesString = messages == 1 ? 'Nachricht' : 'Nachrichten';
                    const commandsString = commands == 1 ? 'Befehl' : 'Befehle';

                    embed.addField('Durchschnitt:', `${messages} ${messagesString} pro Tag, ${commands} ${commandsString} pro Tag.`);

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