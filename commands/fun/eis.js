const roles = require('../../config/roles'),
    Discord = require('discord.js');

exports.run = (bot, message, args) => {
    let embed = new Discord.RichEmbed({
        image: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/coco_pommel_licking_ice_cream_by_deannart-d75f94b_opt.gif'
        },
        description: '**🍨 Leckeres Eis wird im Chat verteilt!**',
        color: 0x399CE7
    }).setFooter(`Eis angefordert von ${bot.server.members.get(message.author.id).displayName} | Art by DeannART`);

    message.channel.sendEmbed(embed);
};

exports.config = {
    cooldown: 15,
    aliases: ['ice'],
    skip: roles.moderator
};


exports.help = {
    name: 'eis',
    description: 'Eis im Chat verteielen.',
    usage: ['!eis']
};