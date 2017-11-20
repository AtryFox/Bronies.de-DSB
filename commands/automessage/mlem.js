const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        image: {
            url: `${bot.config.BASE_URL}/i/_mlem.gif`
        },
        description: '**Mlem o3o**',
        color: 0x399CE7
    }).setFooter(`Der Chat wurde gemlemt von ${bot.server.members.get(message.author.id).displayName} | Art by n0nnny`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 600,
    skip: roles.moderator,
    global_cooldown: true,
    trusted: false
};


exports.help = {
    name: 'mlem',
    description: 'Mlem.',
    usage: ['!mlem']
};