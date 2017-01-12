const roles = require('../../config/roles'),
    Discord = require('discord.js'),
    moment = require('moment');

moment.locale('de');

exports.run = (bot, message, args) => {
    let member = null;

    if (args.length == 0) {
        member = bot.server.members.get(message.author.id);
    } else {
        const arg = args[0];

        if (/(\d{18})/.test(arg)) {
            let id = /(\d{18})/.exec(arg)[1];
            if (bot.server.members.has(id)) {
                member = bot.server.members.get(id);
            }
        } else {
            let search = args.join(' ');

            if (bot.users.exists('username', search)) {
                if (bot.server.members.has(bot.users.find('username', search).id)) {
                    member = bot.server.members.get(bot.users.find('username', search).id);
                }
            }

        }
    }

    if (member == null) {
        bot.respond(message, `Der Nutzer \`${args.join(' ')}\` wurde nicht gefunden.`);
        return;
    }

    let embed = new Discord.RichEmbed({
        author: {
            name: bot.server.name,
            icon_url: bot.server.iconURL,
            url: 'http://bronies.de/'
        },
        thumbnail: {
            url: member.user.displayAvatarURL
        },
        title: `Informationen zu \`${member.user.username}\`#\`${member.user.discriminator}\`:`,
        fields: [
            {
                name: 'Nutzer ID:',
                value: member.id
            },
            {
                name: 'Anzeigename:',
                value: member.displayName
            },
            {
                name: 'Nutzer erstellt am:',
                value: `${moment(member.user.createdAt).format('LLL')} (${moment(member.user.createdAt).fromNow()})`
            },
            {
                name: 'Nutzer beigetreten am:',
                value: `${moment(member.joinedAt).format('LLL')} (${moment(member.joinedAt).fromNow()})`
            },
            {
                name: 'Höchste Rolle:',
                value: member.highestRole.name
            },
            {
                name: 'Link zum Avatar:',
                value: `[${member.user.displayAvatarURL}](${member.user.displayAvatarURL})`
            }
        ],
        color: 0xFF9916
    });

    message.channel.sendEmbed(embed);
};

exports.config = {
    aliases: ['who', 'about', 'a'],
    role: roles.moderator,
    server: true
};

exports.help = {
    name: 'whois',
    description: 'Zeigt Informationen zu einem Nutzer an.',
    usage: ['!whois @Username', '!who userid']
};