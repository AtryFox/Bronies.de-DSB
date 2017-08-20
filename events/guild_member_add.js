const Discord = require('discord.js');

exports.Event = function (bot) {
    this.bot = bot;
};

exports.run = (member) => {
    const bot = this.bot;

    let embed = new Discord.RichEmbed({
        title: 'Ein neues Mitglied ist zu uns gestoßen!',
        description: `Hey **${member}**, willkommen auf dem offiziellen Discord Server von [Bronies.de](http://bronies.de/). Wirf doch zunächst einen Blick in <#${bot.config.INFO_CH}> für alle wichtigen Informationen, Regeln und Bot-Befehle.`,
        thumbnail: {
            url: `${bot.config.BASE_URL}/i/_join2.png`
        },
        color: 0x5FBB4E
    }).setFooter(`${member.user.tag} ist dem Server beigetreten.`, member.user.displayAvatarURL);

    bot.channels.get(bot.config.DEFAULT_CH).send({embed});
};

exports.config = {
    name: 'guildMemberAdd',
    enabled: true
};