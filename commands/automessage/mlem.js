const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    function randomInt(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    let file = `_mlem${randomInt(1, 2)}.gif`;

    let embed = new Discord.RichEmbed({
        image: {
            url: `${bot.config.BASE_URL}/i/${file}`
        },
        description: '**Mlem o3o**',
        color: 0x399CE7
    }).setFooter(`Der Chat wurde gemlemt von ${bot.server.members.get(message.author.id).displayName}`);

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