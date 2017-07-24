const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: bot.config.BASE_URL + '/i/_beer.png'
        },
        description: '**🍺 Eine Runde Bier wird im Chat verteilt!**',
        color: 0xD1973D
    }).setFooter(`Bier angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by Gretsch1962 & Axelak47 & Joey-Darkmeat`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 300,
    aliases: ['bier'],
    skip: roles.moderator
};


exports.help = {
    name: 'beer',
    description: 'Bier im Chat verteielen.',
    usage: ['!beer']
};