const roles = require('../../config/roles'),
    table = require('text-table'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    function showCommands() {
        let text = '\n\nBefehle müssen `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

        text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

        let canRun = [];

        bot.commands.forEach(command => {
            if ('role' in command.config) {
                if (!bot.checkPermissions(command.config.role, message.author)) {
                    return;
                }
            }

            let trusted = true;
            if('trusted' in command.config) {
                trusted = command.config.trusted;
            }

            if(trusted && !bot.checkTrusted(message.author)){
                return;
            }

            canRun.push(command.help.name);
        });

        let commandsTable = [],
            columns = 3;
        for (let ix = 0; ix < canRun.length; ix += columns)
            commandsTable.push(canRun.slice(ix, ix + columns));

        text += '```' + table(commandsTable, {hsep: '    '}) + '```';

        text += '\nUm mehr Infos zu einem Befehl zu erhalte nutze `!help commandname`, also zum Beispiel: `!help nsfw`.';

        if (bot.checkPermissions(roles.moderator, message.author)) {
            text += '\n\nWeitere **Moderationsbefehle** von <@155149108183695360> sind über `?help` verfügbar.';
        }

        if(!bot.checkTrusted(message.author)) {
            text += '\n\n:pushpin: Du schaltest weitere Befehle frei, sobald du **Level 3** erreichst.';
        }

        if (here && bot.checkTrusted(message.author)) {
            bot.respond(message, text, false);
        } else {
            bot.respondPm(message, text);

            if (message.channel.type == 'text') {
                message.delete();
            }
        }
    }

    function showCommandHelp() {
        const cmd = args[0].toLowerCase();

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
            color: 0xEA428B
        });

        let description = cmdObj.help.description;

        let trusted = true;
        if('trusted' in cmdObj.config) {
            trusted = cmdObj.config.trusted;
        }

        if(trusted) {
            description += '\n\n__Info:__\nErfordert die **`@Trusted`**-Rolle.';
        }

        embed.setDescription(description);

        if ('role' in cmdObj.config) {
            embed.addField('Benötiger Rang', bot.server.roles.get(cmdObj.config.role).name, true);
        }

        if ('cooldown' in cmdObj.config) {
            let globalCooldown = false;

            if('global_cooldown' in cmdObj.config) {
                globalCooldown = cmdObj.config.global_cooldown;
            }

            if(globalCooldown) {
                embed.addField('Globaler Cooldown', cmdObj.config.cooldown + ' Sekunden', true);
            } else {
                embed.addField('Cooldown', cmdObj.config.cooldown + ' Sekunden', true);
            }

            if ('skip' in cmdObj.config) {
                embed.addField('Cooldown wird ignoriert ab', bot.server.roles.get(cmdObj.config.skip).name, true);
            }
        }

        if ('aliases' in cmdObj.config) {
            embed.addField('Alias', cmdObj.config.aliases.join(' / '), true);
        }

        embed.addField('Beispiele', '```' + cmdObj.help.usage.join('\n') + '```');

        if ('thumbnail' in cmdObj.help) {
            embed.setThumbnail(cmdObj.help.thumbnail);
        }

        if (here && bot.checkPermissions(roles.moderator, message.author)) {
            message.channel.send({embed});
        } else {
            message.author.send({embed});

            if (message.channel.type == 'text') {
                message.delete();
            }
        }
    }

    const here = args.includes('here');

    if (args.length < 1 || (args.length == 1 && here && bot.checkPermissions(roles.moderator, message.author))) {
        showCommands();
    } else {
        showCommandHelp();
    }
};

exports.config = {
    trusted: false,
    cooldown: 10,
    skip: roles.moderator
};

exports.help = {
    name: 'help',
    description: 'Zeigt alle verfügbaren Befehle bzw. Informationen zu einzelnen Befehlen an.\n\nMit dem Parameter `here` wird die Hilfe im aktuellen Channel und nicht im privaten Chat angezeigt. Dieser Parameter muss immer am Ende stehen.',
    usage: ['!help', '!help version', '!help nsfw here']
};