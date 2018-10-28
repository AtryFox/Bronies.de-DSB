const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    function randomInt(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    let file = `_blep${randomInt(1, 2)}.gif`;

    let embed = new Discord.RichEmbed({
        image: {
            url: `${bot.config.BASE_URL}/i/${file}`
        },
        description: '**Blep o3o**',
        color: 0x399CE7
    }).setFooter(`Der Chat wurde geblept von ${bot.server.members.get(message.author.id).displayName}`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 600,
    aliases: ['bleb', 'plep', 'pleb'],
    skip: roles.moderator,
    global_cooldown: true,
    trusted: false
};


exports.help = {
    name: 'blep',
    description: 'Blep.',
    usage: ['!blep']
};