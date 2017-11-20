const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    function randomInt(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    let file = `_glomp${randomInt(1, 9)}.gif`;

    let embed = new Discord.RichEmbed({
        image: {
            url: `${bot.config.BASE_URL}/i/${file}`
        },
        description: '**❤ Glomp!**',
        color: 0xFCB6DF
    }).setFooter(`Der Chat wurde geglompt von ${bot.server.members.get(message.author.id).displayName} | Art by n0nnny`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 600,
    aliases: ['glomb', 'clomp'],
    skip: roles.moderator,
    global_cooldown: true,
    trusted: false
};

exports.help = {
    name: 'glomp',
    description: 'Glomp ❤',
    usage: ['!cookies']
};
