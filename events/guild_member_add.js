const Discord = require('discord.js');

exports.Event = function(bot) {
    this.bot = bot;
};

exports.run = (member) => {
    const bot = this.bot;

    let embed = new Discord.RichEmbed({
        title: 'Ein neues Mitglied ist zu uns gestoßen!',
        description: `Hey **${member.user.username}**, willkommen auf dem offiziellen Discord Server von [Bronies.de](http://bronies.de/). Wirf doch zunächst einen Blick in **#info** für alle wichtigen Informationen und Bot-Befehle.`,
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_join.png'
        },
        color: 0x5FBB4E
    }).setFooter('Viel Spaß auf dem Server!');

    bot.channels.get(bot.config.DEFAULT_CH).send({embed});
};

exports.config = {
    name: 'guildMemberAdd',
    enabled: true
};