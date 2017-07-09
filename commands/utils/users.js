const roles = require('../../config/roles'),
    Discord = require('discord.js'),
    moment = require('moment');

moment.locale('de');

exports.run = (bot, message, args) => {
    const botCount = bot.server.roles.get(roles.bot).members.size,
        memberCount = bot.server.memberCount,
        onlineCount = bot.server.presences.findAll('status', 'online').length,
        awayCount = bot.server.presences.findAll('status', 'idle').length,
        dndCount = bot.server.presences.findAll('status', 'dnd').length,
        offlineCount = memberCount - onlineCount - awayCount - dndCount;

    let embed = new Discord.RichEmbed({
        author: {
            name: bot.server.name + ' - Nutzer',
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        thumbnail: {
            url: bot.server.iconURL
        },
        title: `${memberCount} Clients verbunden`,
        description: `davon ${memberCount - botCount} 👥 Nutzer und ${botCount} 🤖 Bots`,
        fields: [
            {
                name: 'Online',
                value: onlineCount,
                inline: true
            },
            {
                name: 'Abwesend',
                value: awayCount,
                inline: true
            },
            {
                name: 'Beschäftigt',
                value: dndCount,
                inline: true
            },
            {
                name: 'Offline',
                value: offlineCount,
                inline: true
            }
        ],
        color: 0xEF7135
    }).setFooter(moment().format('LLLL'));

    message.channel.send({embed});
};

exports.config = {
    aliases: ['usr'],
    server: true,
    role: roles.community,
    cooldown: 60,
    skip: roles.moderator
};

exports.help = {
    name: 'users',
    description: 'Zeigt Nutzerstatistiken zum Server an.',
    usage: ['!users']
};