const roles = require('../../config/roles');

exports.run = (bot, message, args) => {
    if (args.length < 2) {
        bot.respond(message, 'dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help trust`', true, 10);
        return message.delete();
    }

    let target;

    if(message.mentions.members.size != 1) {
        if(bot.server.members.has(args[0])) {
            bot.server.members.get(args[0]);
        } else {
            bot.respond(message, `der Nutzer \`${args[0]}\` konnte nicht gefunden werden.`, true, 10);
            return message.delete();
        }
    } else {
        target = message.mentions.members.first();
    }


    function setStatus(statusId) {
        bot.redis.hset(key, field, statusId, err => {
            if(err) {
                bot.log('Redis Connection Error!' + err);
                bot.respond(message, 'Fehler beim Verbinden zum Redis Server!', true, 10);
                return message.delete();
            }

            bot.respond(message, `✅ Der Trust Status von ${target} wurde von ${message.author} auf \`${args[1]}\` gesetzt.`);
            return message.delete();
        });
    }

    function resetStatus() {
        bot.redis.hdel(key, field, err => {
            if(err) {
                bot.log('Redis Connection Error!' + err);
                bot.respond(message, 'Fehler beim Verbinden zum Redis Server!', true, 10);
                return message.delete();
            }

            bot.respond(message, `✅ Der Trust Status von ${target} wurde von ${message.author} zurückgesetzt.`);
            return message.delete();
        });
    }


    const key = `${bot.server.id}.TrustStatus`;
    const field = `${target.id}`;

    switch (args[1]) {
        case 'force':
            setStatus(1);
            target.addRole(roles.trusted);
            break;
        case 'refuse':
            setStatus(2);
            target.removeRole(roles.trusted);
            break;
        case 'reset':
            resetStatus();
            break;
        default:
            bot.respond(message, `die Option \`${args[1]}\` wurde nicht gefunden.`, true, 10);
            message.delete();
            break;
    }
};

exports.config = {
    server: true,
    role: roles.moderator,
    trusted: false
};

exports.help = {
    name: 'trust',
    description: 'Trust Status eines Nutzers ändern.',
    usage: ['!trust @Discord force', '!trust @Discord refuse', '!trust @Discord reset']
};