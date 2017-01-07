const roles = require('../../config/roles'),
    table = require('text-table'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    if (args.length != 1) {
        let text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

        text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

        let canRun = [];

        bot.commands.forEach(command => {
            if ('role' in command.config) {
                if (!bot.checkPermissions(command.config.role, message.author)) {
                    return;
                }
            }

            canRun.push(command.help.name);
        });

        let commandsTable = [],
            columns = 3;
        for (let ix = 0; ix < canRun.length; ix += columns)
            commandsTable.push(canRun.slice(ix, ix + columns));

        text += '```' + table(commandsTable, {hsep: '    '}) + '```';

        text += '\nUm mehr Infos zu einem Befehl zu erhalte nutze `!help commandname`, also zum Beispiel: `!help nsfw`.';

        bot.respondPm(message, text);

        if (message.channel.type == 'text') {
            message.delete();
        }
    } else {
        const cmd = args[0];

        if (!bot.commands.has(cmd) && !bot.aliases.has(cmd)) {
            return this.run(bot, message, []);
        }

        let cmdObj;

        if (bot.commands.has(cmd)) {
            cmdObj = bot.commands.get(cmd);
        } else if (bot.aliases.has(cmd)) {
            cmdObj = bot.commands.get(bot.aliases.get(cmd));
        }

        let embed = new Discord.RichEmbed({
            thumbnail: {
                url: bot.user.avatarURL
            },
            title: `Hilfe für den Befehl \`${cmdObj.help.name}\`:`,
            description: cmdObj.help.description,
            color: 0x632E86
        });

        if ('role' in cmdObj.config) {
            embed.addField('Benötiger Rang', cmdObj.config.role, true);
        }

        if ('cooldown' in cmdObj.config) {
            embed.addField('Cooldown', cmdObj.config.cooldown + ' Sekunden', true);

            if('skip' in cmdObj.config) {
                embed.addField('Cooldown wird übersprungen ab Rang', cmdObj.config.skip, true);
            }
        }

        if ('aliases' in cmdObj.config) {
            embed.addField('Alias', cmdObj.config.aliases.join(' / '), true);
        }

        embed.addField('Beispiele', '```' + cmdObj.help.usage.join('\n') + '```');

        message.channel.sendEmbed(embed);
    }
};

exports.config = {};

exports.help = {
    name: 'help',
    description: 'Zeigt alle verfügbaren Befehle bzw. Informationen zu einzelnen Befehlen an.',
    usage: ['!help', '!help version']
};