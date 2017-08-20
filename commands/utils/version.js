const roles = require('../../config/roles'),
    moment = require('moment'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    const linkLastCommit = 'https://github.com/DerAtrox/Bronies.de-DSB/commit/' + bot.versionInfo.version;

    let embed = new Discord.RichEmbed({
        author: {
            name: `DerAtrox/Bronies.de-DSB@` + bot.versionInfo.version,
            icon_url: bot.user.avatarURL
        },
        thumbnail: {
            url: bot.user.avatarURL
        },
        description: 'Umgesetzt mit Hilfe von [Node.js](https://nodejs.org/) und [discord.js](https://discord.js.org/).',
        fields: [
            {
                name: 'Version',
                value: bot.versionInfo.version,
                inline: true
            },
            {
                name: 'Letzter Commit',
                value: `[Öffnen](${linkLastCommit})`,
                inline: true
            }
        ],
        color: 0x632E86
    }).setFooter(moment().format('LLLL'));

    if ('message' in bot.versionInfo) {
        embed.addField('Letzte Commitnachricht', bot.versionInfo.message, false);
    }

    if ('timestamp' in bot.versionInfo) {
        embed.addField('Erstellt', (moment(bot.versionInfo.timestamp, 'YYYY-MM-DD HH:mm:ss Z').locale('de').fromNow()), false);
    }

    message.channel.send({embed});
};

exports.config = {
    cooldown: 600,
    global_cooldown: true,
    trusted: false,
    skip: roles.moderator,
    aliases: ['ver']
};

exports.help = {
    name: 'version',
    description: 'Zeigt die aktuelle Version des Bots an.',
    usage: ['!version']
};