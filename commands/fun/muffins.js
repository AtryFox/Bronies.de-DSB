const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_muffins.png'
        },
        description: '**Derpy war da! It\'s Muffin time!**',
        color: 0x808AA7
    }).setFooter(`Muffins angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by Heartwarmer-MLP`);

    message.channel.sendEmbed(embed);
};

exports.config = {
    cooldown: 15,
    aliases: ['muffin'],
    skip: roles.moderator
};

exports.help = {
    name: 'muffins',
    description: 'Derpy bringt Muffins vorbei.',
    usage: ['!muffins'],
    thumbnail: 'https://deratrox.de/dev/Bronies.de-DSB/_muffins.png'
};