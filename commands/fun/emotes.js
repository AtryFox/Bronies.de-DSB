const roles = require('../../config/roles'),
    moment = require('moment'),
    Discord = require('discord.js');

moment.locale('de');

exports.run = (bot, message, args) => {
    if (args.length == 0) {
        let embed = new Discord.RichEmbed({
            author: {
                name: bot.server.name,
                icon_url: bot.server.iconURL,
                url: 'http://bronies.de/'
            },
            title: `Emojis/Emoticons Statistik:\n`,
            color: 0xF3B5CF
        });

        bot.r.table('emotes_stats').orderBy(bot.r.desc('count')).limit(5).run().then(emotes => {
            // REMOVE emotes_stats!!!


            emotes.forEach(emote => {
                let emoji = bot.getEmoji(emote.id.replace(/:/g, ''));
                if (emoji == ':robot:') {
                    emoji = emote.id;
                }

                let first = moment(emote.first);
                let last = moment(emote.last);

                let lastBy = null;
                if (bot.server.members.has(emote.lastBy)) {
                    let user = bot.server.members.get(emote.lastBy).user;
                    lastBy = user.username + '#' + user.discriminator;
                } else {
                    lastBy = 'Unbekannt';
                }

                if (lastBy != null) {
                    lastBy = `Zuletzt genutzt von **${lastBy}** ${last.fromNow()}.`;
                }

                embed.addField(`${emote.count} mal __${emoji}__`, `Erstmals genutzt am ${first.format('LL')} um ${first.format('LT')} Uhr.\n${lastBy}`);
            });

            message.channel.sendEmbed(embed);
        }).error(error => {
            bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', false);
            bot.log(`Could not get emote stats db:\n${error}`);
        });
        return;
    }

    let arg = args[0].toLowerCase();

    if(arg == 'levels' || arg == 'ranks') {
        let embed = new Discord.RichEmbed({
            author: {
                name: bot.server.name,
                icon_url: bot.server.iconURL,
                url: 'http://bronies.de/'
            },
            description: `Emojis/Emoticons Rangliste:\n`,
            color: 0xF3B5CF
        });

        let level = 1;

        bot.r.table('emotes_users').group('user').count().ungroup().limit(5).orderBy(bot.r.desc('reduction')).run().then(ranks => {
            ranks.forEach(rank => {
                let name = null;
                if (bot.server.members.has(rank.group)) {
                    let user = bot.server.members.get(rank.group).user;
                    name = user.username + '#' + user.discriminator;
                } else {
                    name = 'Unbekannt';
                }

                embed.addField(`Platz ${level}: __${name}__`, `${rank.reduction} Emotes gesendet.`);
            });

            message.channel.sendEmbed(embed);
        }).error(error => {
            bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', false);
            bot.log(`Could not get emote stats db:\n${error}`);
        });
        return;
    }

    let member = null;

    if(/(\d{18})/.test(arg)) {
        let id = /(\d{18})/.exec(arg)[1];
        if(bot.server.members.has(id)) {
            member = bot.server.members.get(id);
        }
    }


    if (member != null) {
        const name = member.user.username + '#' + member.user.discriminator;

        let embed = new Discord.RichEmbed({
            author: {
                name: bot.server.name,
                icon_url: bot.server.iconURL,
                url: 'http://bronies.de/'
            },
            thumbnail: {
                url: member.user.displayAvatarURL
            },
            title: `Emojis/Emoticons Statistik von **${name}**:\n`,
            color: 0xF3B5CF
        });

        bot.r.db('bronies_DSB').table('emotes_users').filter(bot.r.row('user').eq(member.user.id))
            .group('emote').count().ungroup().orderBy(bot.r.desc('reduction')).innerJoin(
            bot.r.db('bronies_DSB').table('emotes_users').filter(bot.r.row('user').eq(member.user.id))
                .group('emote').max('added')('added').ungroup(), (user, emote) => {
                return user('group').eq(emote('group'))
            }).map({
            emote: bot.r.row('left')('group'),
            count: bot.r.row('left')('reduction'),
            last: bot.r.row('right')('reduction')
        }).limit(3).run().then(emotes => {
            if(emotes.length == 0) {
                embed.setDescription('Es wurden noch keine Emotes versendet.');
                message.channel.sendEmbed(embed);
                return;
            }

            emotes.forEach(emote => {
                let emoji = bot.getEmoji(emote.emote.replace(/:/g, ''));
                if (emoji == ':robot:') {
                    emoji = emote.emote;
                }

                let last = moment(emote.last);

                embed.addField(`${emote.count} mal __${emoji}__`, `Zuletzt genutzt ${last.fromNow()}.`);
            });

            bot.r.db('bronies_DSB').table('emotes_users').group('user').count().ungroup().orderBy(bot.r.desc('reduction')).offsetsOf(bot.r.row('group').eq(member.user.id)).run().then(result => {
                const rank = parseInt(result) + 1;

                bot.r.db('bronies_DSB').table('emotes_users').filter(bot.r.row('user').eq('245692454546833409')).group('user').count().ungroup().run().then(result => {
                    const count = result[0].reduction;

                    embed.setDescription(`Bisher wurden **${count}** Emotes und Emojis versendet, damit ist **${name}** auf Platz **${rank}**.`);

                    message.channel.sendEmbed(embed);
                }).error(error => {
                    bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', false);
                    bot.log(`Could not get user rank db:\n${error}`);
                });
            }).error(error => {
                bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', false);
                bot.log(`Could not get user rank db:\n${error}`);
            });


        }).error(error => {
            bot.respond(message, 'Datenbankabfrage fehlgeschlagen!', false);
            bot.log(`Could not get user stats db:\n${error}`);
        });
    }
};

exports.config = {
    aliases: ['emote', 'e'],
    server: true,
    role: roles.community,
    cooldown: 15,
    skip: roles.moderator
};

exports.help = {
    name: 'emotes',
    description: 'Zeigt Statistiken zu genutzten Emotes bzw. Emojis an.\n\nGezählt werden Server-Emoji (z.B. `:twi_1:`) und Emoticons (z.B. `:3`).\nDie Standard-Emoji (z.B. `:robot:`) werden noch nicht gezählt.',
    usage: ['!emotes', '!e @DerAtrox#1257']
};