const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: `${bot.config.BASE_URL}/i/_cider.png`
        },
        description: '**🍺 Eine Runde Cider wird im Chat verteilt!**',
        color: 0xD1973D
    }).setFooter(`Cider angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by ParagonAJ`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 300,
    aliases: ['cider'],
    skip: roles.moderator
};


exports.help = {
    name: 'cider',
    description: 'Cider im Chat verteielen.',
    usage: ['!beer']
};