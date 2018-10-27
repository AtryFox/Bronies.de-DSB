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
        description: '**🍨 Leckeres Eis wird im Chat verteilt!**',
        color: 0x399CE7
    }).setFooter(`Eis angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by DeannART`);

    message.channel.send({embed});
};

exports.config = {
    cooldown: 600,
    aliases: ['ice'],
    skip: roles.moderator,
    global_cooldown: true,
    trusted: false
};


exports.help = {
    name: 'eis',
    description: 'Eis im Chat verteielen.',
    usage: ['!eis']
};