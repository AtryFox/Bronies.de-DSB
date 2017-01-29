const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_coffee.png'
        },
        title: ':coffee: Eine Kanne brühend heißer Kaffees steht bereit!',
        color: 0x6f4e37
    });

    message.channel.sendEmbed(embed);
};

exports.config = {
    cooldown: 15,
    skip: roles.moderator
};

exports.help = {
    name: 'coffee',
    description: 'Eine Kanne Kaffe in den Chat stellen.',
    usage: ['!coffee']
};