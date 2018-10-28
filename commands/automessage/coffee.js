const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    function randomInt(low, high) {
        return Math.floor(Math.random() * (high - low + 1) + low);
    }

    let file = `_coffee${randomInt(1, 4)}.gif`;

    let embed = new Discord.RichEmbed({
        image: {
            url: `${bot.config.BASE_URL}/i/${file}`
        },
        description: '**☕ Eine Kanne brühend heißer Kaffee steht bereit!**',
        color: 0x6f4e37
    }).setFooter(`Kaffee angefordert von ${bot.server.members.get(message.author.id).displayName}`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 300,
    aliases: ['kaffee'],
    skip: roles.moderator,
    global_cooldown: true,
    trusted: false
};

exports.help = {
    name: 'coffee',
    description: 'Eine Kanne Kaffe in den Chat stellen.',
    usage: ['!coffee']
};