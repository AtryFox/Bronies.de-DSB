const roles = require('../../config/roles'),
    Discord = require('discord.js'),
    urban = require('urban');

exports.run = (bot, _message, args) => {
    const message = _message
    _message.delete();

    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help urban`', true, 5);
    }

    urban(args.join(' ')).res(res => {
        if (res.length == 0) {
            return bot.respond(message, `Keine Definition für den Begriff \`${args.join(' ')}\` gefunden.`, true, 5);
        }

        let current = 0;

        function genEmbedForDef(data) {
            let embed = new Discord.RichEmbed({
                title: `Definition für den Begriff \`${data.word}\`:`,
                description: `[Zur Definition](${data.permalink}) | ${data.thumbs_up} Upvotes | ${data.thumbs_down} Downvotes | Seite ${current + 1}/${res.length}\r\n\r\n${data.definition}`,
                color: 0xEFFF00
            }).setFooter(`Definiert für ${bot.server.members.get(message.author.id).displayName} | Logo by Urban Dictionary`, 'https://deratrox.de/dev/Bronies.de-DSB/_urban.png')
                .addField('Beispiel:', data.example);

            return embed;
        }

        let data = res[current];

        let embed = genEmbedForDef(data);

        message.channel.send({embed}).then(msg => {
            msg.react('1⃣').then(() => msg.react('⬅').then(() => msg.react('➡').then(() => msg.react('🇽'))));

            const collector = msg.createReactionCollector(
                (reaction, user) => user.id == message.author.id,
                {time: 5 * 120000}
            );

            collector.on('collect', r => {
                r.remove(message.author.id);

                switch (r.emoji.name) {
                    case '1⃣':
                        current = 0;

                        break;
                    case '➡':
                        if (current >= res.length - 1) return;

                        current++;
                        break;
                    case '⬅':
                        if (current <= 0) return;

                        current--;
                        break;
                    case '🇽':
                        return collector.stop();
                }

                embed = genEmbedForDef(res[current]);
                msg.edit({embed});
            });
            collector.on('end', () => {
                msg.delete();
            });
        });
    });
};

exports.config = {
    cooldown: 30,
    aliases: ['ud', 'define'],
    skip: roles.moderator,
    role: roles.community
};


exports.help = {
    name: 'urban',
    description: 'Zeigt die ersten Zehn Definitionen für einen Begriff von [Urban Dictionary](https://www.urbandictionary.com/) an.',
    usage: ['!urban 1337']
};