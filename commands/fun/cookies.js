const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    function randomInt (low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    let file = '_cookies' + randomInt(1, 6) + '.png';

    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/' + file
        },
        description: '**🍪 Eine Runde Kekse wird im Chat verteilt!**',
        color: 0x6C4733
    }).setFooter(`Kekse angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by FilPaperSoul`);

    message.channel.sendEmbed(embed);
};

exports.config = {
    cooldown: 15,
    aliases: ['kekse', 'keks'],
    skip: roles.moderator
};

exports.help = {
    name: 'cookies',
    description: 'Eine Runde Kekse im Chat verteielen.',
    usage: ['!cookies']
};