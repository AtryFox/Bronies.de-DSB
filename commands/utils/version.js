const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        author: {
            name: bot.server.name,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        thumbnail: {
            url: bot.user.avatarURL
        },
        title: `DerAtrox/Bronies.de-DSB@` + bot.version,
        description: 'Umgesetzt mit Hilfe von [Node.js](https://nodejs.org/) und [discord.js](https://discord.js.org/).',
        fields: [
            {
                name: 'Version',
                value: bot.version,
                inline: true
            },
            {
                name: 'Letzter Commit',
                value: 'https://github.com/DerAtrox/Bronies.de-DSB/commit/' + bot.version,
                inline: true
            }
        ],
        color: 0x632E86
    });

    message.channel.sendEmbed(embed);
};

exports.config = {
    aliases: ['v']
};

exports.help = {
    name: 'version',
    description: 'Zeigt die aktuelle Version des Bots an.',
    usage: ['!version']
};