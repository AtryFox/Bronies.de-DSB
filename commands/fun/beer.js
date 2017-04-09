const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_beer.png'
        },
        description: '**🍺 Eine Runde Bier wird im Chat verteilt!**',
        color: 0xD1973D
    }).setFooter(`Bier angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by Gretsch1962 & Axelak47 & Joey-Darkmeat`);

    message.channel.sendEmbed(embed);
};

exports.config = {
    cooldown: 15,
    aliases: ['bier'],
    skip: roles.moderator
};


exports.help = {
    name: 'beer',
    description: 'Bier im Chat verteielen.',
    usage: ['!beer']
};