const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        image: {
            url: `${bot.config.BASE_URL}/i/_blep.gif`
        },
        description: '**Blep o3o**',
        color: 0x399CE7
    }).setFooter(`Der Chat wurde geblept von ${bot.server.members.get(message.author.id).displayName} | Art by n0nnny`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 600,
    aliases: ['bleb', 'plep'],
    skip: roles.moderator,
    global_cooldown: true
};


exports.help = {
    name: 'blep',
    description: 'Blep.',
    usage: ['!blep']
};