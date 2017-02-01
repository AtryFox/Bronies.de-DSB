const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_beer.png'
        },
        description: '**🍺 Eine Runde Bier wird im Chat verteilt!**',
        color: 0xD1973D
    });

    message.channel.sendEmbed(embed);
};

exports.config = {
    cooldown: 15,
    skip: roles.moderator
};


exports.help = {
    name: 'beer',
    description: 'Bier im Chat verteielen.',
    usage: ['!beer']
};