const Discord = require('discord.js');

exports.Event = function (bot) {
    this.bot = bot;
};

exports.run = (member) => {
    const bot = this.bot;

    let embed = new Discord.RichEmbed({
        title: 'Ein Mitglied hat uns verlassen.',
        description: `**${member.user.username}** hat den Server verlassen. Bye bye **${member.user.username}**...`,
        thumbnail: {
            url: `${bot.config.BASE_URL}/i/_leave.png`
        },
        color: 0xEC4141
    }).setFooter(`${member.user.tag} hat den Server verlassen.`, member.user.displayAvatarURL);

    bot.channels.get(bot.config.DEFAULT_CH).send({embed});
};

exports.config = {
    name: 'guildMemberRemove',
    enabled: true
};