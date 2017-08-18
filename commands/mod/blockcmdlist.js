const roles = require('../../config/roles'),
    table = require('text-table');

exports.run = (bot, message, args) => {
    if (args.length < 1) {
        bot.respond(message, 'dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help blockcmdlist`', true, 10);
        return message.delete();
    }

    let target;

    if(message.mentions.members.size != 1) {
        if(bot.server.members.has(args[0])) {
            bot.server.members.get(args[0]);
        } else {
            bot.respond(message, `der Nutzer \`${args[0]}\` konnte nicht gefunden werden.`, true, 10);
            return message.delete();
        }
    } else {
        target = message.mentions.members.first();
    }

    const key = `${bot.server.id}.BlockCmd.${target.id}`;

    bot.redis.hgetall(key, (err, replies) => {
        if(err) {
            bot.log('Redis Connection Error!' + err);
            bot.respond(message, 'Fehler beim Verbinden zum Redis Server!', true, 10);
            return message.delete();
        }

        if(replies == null) {
            bot.respond(message, `für den Nutzer ${args[0]} sind keine Befehle gesperrt.`, true);
        } else {
            let text = `für den Nutzer ${args[0]} sind folgende Befehle gesperrt:\n`;

            const cmds = Object.keys(replies);

            let commandsTable = [],
                columns = 3;
            for (let ix = 0; ix < cmds.length; ix += columns)
                commandsTable.push(cmds.slice(ix, ix + columns));

            text += '```' + table(commandsTable, {hsep: '    '}) + '```';

            bot.respond(message, text, true);

        }

        return message.delete();
    });


};

exports.config = {
    server: true,
    role: roles.moderator,
    trusted: false,
    aliases: ['blocklist', 'bcmdlist']
};

exports.help = {
    name: 'blockcmdlist',
    description: 'Zeigt die gesperrten Befehle für einen Nutzer an.',
    usage: ['!blockcmdlist @Discord']
};