const roles = require('../../config/roles');

exports.run = (bot, message, args) => {
    const msg = message;

    if (message.channel.type != 'dm') {
        message.delete();
        return;
    }

    const communityRole = bot.server.roles.get(roles.user);
    const member = bot.getGuildMember(msg.author);

    if (!member.roles.has(roles.user)) {
        member.addRole(communityRole);
        bot.server.channels.get(bot.config.LOG_CH).send(`${message.author.tag} hat die Community-Gruppe via \`!community\` freigeschaltet.`);
        return bot.respondPm(msg, 'Die Community-Gruppe wurde erfolgreich freigeschaltet!');
    }
};

exports.config = {
    server: false,
    trusted: false
};

exports.help = {
    name: 'community',
    description: 'Vergibt die Community Gruppe außerhalb des Servers',
    usage: ['!community']
};