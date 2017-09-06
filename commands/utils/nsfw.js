const roles = require('../../config/roles');

exports.run = (bot, message, args) => {
    const msg = message;

    if (message.channel.type != 'dm') {
        message.delete();
    }

    const arg = args[0].toLowerCase();

    const nsfwRole = bot.server.roles.get(roles.nsfw);
    const member = bot.getGuildMember(msg.author);

    if (arg == 'join_alt') {
        if (!member.roles.has(roles.nsfw)) {
            return bot.respondPm(msg, 'Du bist im Begriff den NSFW-Bereich des Bronies.de Discord Servers bezutreten. Dieser Bereich enthält pornografische Inhalte und ist für Nutzer unter 18 Jahren nicht geeignet. Möchtest du beitreten antworte mit `!nsfw join`.');
        }
    } else if (arg == 'join') {
        if (!member.roles.has(roles.nsfw)) {
            member.addRole(nsfwRole);
            return bot.respondPm(msg, 'Bronies.de NSFW Bereich beigetreten. :smirk:');
        }
    } else if (arg == 'leave') {
        if (member.roles.has(roles.nsfw)) {
            member.removeRole(nsfwRole);
            return bot.respondPm(msg, 'Bronies.de NSFW Bereich verlassen.');
        }
    } else {
        return bot.respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
    }
};

exports.config = {
    server: false,
    role: roles.user,
    trusted: false,
    params: 1
};

exports.help = {
    name: 'nsfw',
    description: '#nsfw betreten oder verlassen.',
    usage: ['!nsfw join', '!nsfw leave']
};