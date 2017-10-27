const roles = require('../../config/roles'),
    Discord = require('discord.js'),
    moment = require('moment');

moment.locale('de');

exports.run = (bot, message, args) => {
    let member = null;

    if (args.length == 0) {
        member = bot.server.members.get(message.author.id);
    } else {
        if (!bot.checkPermissions(roles.moderator, message.author)) {
            bot.respondPm(message, 'Du besitzt nicht genügend Rechte um Informationen zu anderen Nutzern abzufragen.');
            message.delete();
            return;
        }

        member = bot.getGuildMemberFromArgs(message, args, 0);
    }

    if (member == null) {
        bot.respond(message, `Der Nutzer \`${args.join(' ')}\` wurde nicht gefunden.`, true, 10);
        return message.delete();
    }

    let embed = new Discord.RichEmbed({
        author: {
            name: Discord.Util.escapeMarkdown(member.user.tag),
            icon_url: member.user.displayAvatarURL,
        },
        thumbnail: {
            url: member.user.displayAvatarURL
        },
        fields: [
            {
                name: 'ID',
                value: member.id,
                inline: true
            },
            {
                name: 'Nickname',
                value: Discord.Util.escapeMarkdown(member.displayName),
                inline: true
            },
            {
                name: 'Status',
                value: member.presence.status,
                inline: true
            },
            {
                name: 'Spiel',
                value: member.presence.game != null ? Discord.Util.escapeMarkdown(member.presence.game.name) : "Kein Spiel aktiv",
                inline: true
            },
            {
                name: 'Registriert',
                value: `${moment(member.user.createdAt).format('lll')}`,
                inline: true
            },
            {
                name: 'Beigetreten',
                value: `${moment(member.joinedAt).format('lll')}`,
                inline: true
            },
            {
                name: 'Höchste Rolle',
                value: member.highestRole.name,
                inline: true
            },
            {
                name: 'Link zum Avatar',
                value: `[${member.user.displayAvatarURL}](${member.user.displayAvatarURL})`,
                inline: true
            }
        ],
        color: 0xFF9916
    }).setFooter(moment().format('LLLL'));

    message.channel.send({embed});
};

exports.config = {
    aliases: ['who', 'about', 'a'],
    role: roles.user,
    trusted: false,
    cooldown: 15,
    skip: roles.moderator,
    server: true
};

exports.help = {
    name: 'whois',
    description: 'Zeigt Informationen zu sich selber an.\nModeratoren oder höher können auch Infos zu anderen Nutzern anzeigen.',
    usage: ['!whois', '!who username']
};