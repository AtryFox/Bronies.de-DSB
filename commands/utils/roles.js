const roles = require('../../config/roles'),
    Discord = require('discord.js'),
    moment = require('moment');

moment.locale('de');


exports.run = (bot, message, args) => {
    let text = '';

    bot.server.roles.forEach(role => {
        text += `<@&${role.id}> (${role.name})\n\`${role.id}\` | ${role.members.size} members | ${role.hexColor}\n\n`;
    });

    let embed = new Discord.RichEmbed({
        author: {
            name: `${bot.server.name} - Rollen`,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        thumbnail: {
            url: bot.server.iconURL
        },
        description: text,
        color: 0xEF7135
    }).setFooter(moment().format('LLLL'));

    message.channel.send({embed});
};

exports.config = {
    aliases: ['r'],
    server: true,
    role: roles.moderator
};

exports.help = {
    name: 'roles',
    description: 'Zeigt alle vorhandenen Rollen des Servers inklusive ihrer IDs an.',
    usage: ['!roles']
};