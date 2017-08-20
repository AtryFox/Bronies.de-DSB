const roles = require('../../config/roles'),
    Discord = require('discord.js'),
    moment = require('moment');


exports.run = (bot, message, args) => {
    bot.levels.getRanklist((err, ranks) => {
        if (err) {
            bot.log(`[Levels] Rank error ${err}`);
            bot.respond(message, `aktueller Rank konnte nicht abgefragt werden.`, true, 10);
            return message.delete();
        }

        function cmpFunction(item) {
            return item[0] == message.author.id
        }

        const currentExp = ranks.find(cmpFunction)[1],
            currentRank = ranks.findIndex(cmpFunction) + 1,
            currentLevel = bot.levels.getLevelFromXp(currentExp),
            levelExp = bot.levels.getLevelExp(currentLevel),
            currentLevelExp = bot.levels.getLevelProgress(currentExp);

        let embed = new Discord.RichEmbed({
            author: {
                name: `${message.author.tag}`,
                icon_url: message.author.displayAvatarURL
            },
            fields: [
                {
                    name: 'Rank',
                    value: `${currentRank}/${ranks.length}`,
                    inline: true
                },
                {
                    name: 'Level',
                    value: currentLevel,
                    inline: true
                },
                {
                    name: 'Exp',
                    value: `${currentLevelExp}/${levelExp} (tot. ${currentExp})`,
                    inline: true
                }
            ],
            color: 0xE7F135
        }).setFooter(moment().format('LLLL'));

        message.channel.send({embed});
    });
};

exports.config = {
    server: true,
    role: roles.user,
    trusted: false,
    skip: roles.moderator,
    cooldown: 300
};

exports.help = {
    name: 'rank',
    description: 'Zeigt euren Rang anhand eurer Aktivität auf dem Server an.',
    usage: ['!rank']
};