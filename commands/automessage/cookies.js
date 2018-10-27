const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let file = `_cookies.gif`;

    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: `${bot.config.BASE_URL}/i/${file}`
        },
        description: '**🍪 Eine Runde Kekse wird im Chat verteilt!**',
        color: 0x6C4733
    }).setFooter(`Kekse angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by Evomanaphy`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 300,
    aliases: ['cookie', 'kekse', 'keks'],
    skip: roles.moderator,
    global_cooldown: true,
    trusted: false
};

exports.help = {
    name: 'cookies',
    description: 'Eine Runde Kekse im Chat verteielen.',
    usage: ['!cookies']
};
