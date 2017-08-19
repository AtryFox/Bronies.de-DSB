const roles = require('../../config/roles');

exports.run = (bot, message, args) => {
    if (args.length < 2) {
        bot.respond(message, 'dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help blockcmd`', true, 10);
        return message.delete();
    }

    let target;

    if(message.mentions.members.size != 1) {
        if(bot.server.members.has(args[0])) {
            target = bot.server.members.get(args[0]);
        } else {
            bot.respond(message, `der Nutzer \`${args[0]}\` konnte nicht gefunden werden.`, true, 10);
            return message.delete();
        }
    } else {
        target = message.mentions.members.first();
    }

    if(target.highestRole.comparePositionTo(bot.server.members.get(message.author.id).highestRole) >= 0 && !bot.checkPermissions(roles.admin, message.author)) {
        bot.respond(message, `nicht genügend Rechte!`, true, 10);
        return message.delete();
    }

    let cmdName;

    if(!bot.commands.has(args[1])) {
        if(bot.aliases.has(args[1])) {
            cmdName = bot.commands.get(bot.aliases.get(args[1])).help.name;
        } else {
            bot.respond(message, `der Befehl \`${args[0]}\` wurde nicht gefunden.`, true, 10);
            return message.delete();
        }
    } else {
        cmdName = bot.commands.get(args[1]).help.name;
    }

    if(cmdName == 'blockcmd') {
        bot.respond(message, `der Befehl \`${cmdName}\` kann nicht gesperrt werden!`, true, 10);
        return message.delete();
    }

    const key = `${bot.server.id}.BlockCmd.${target.id}`;
    const field = `${cmdName}`;

    bot.redis.hget(key, field, (err, reply) => {
        if(err) {
            bot.log('Redis Connection Error!' + err);
            bot.respond(message, 'Fehler beim Verbinden zum Redis Server!', true, 10);
            return message.delete();
        }

        if(reply == null) {
            bot.redis.hset(key, field, 0, err => {
                if(err) {
                    bot.log('Redis Connection Error!' + err);
                    bot.respond(message, 'Fehler beim Verbinden zum Redis Server!', true, 10);
                    return message.delete();
                }

                bot.respond(message, `✅ Der Befehl \`${cmdName}\` wurde für ${target} von ${message.author} gesperrt.`);
                bot.log(`!blockcmd: ${message.author.tag} locks commands \`${cmdName}\` for ${target.user.tag}.`);
                return message.delete();
            });
        } else {
            bot.redis.hdel(key, field, err => {
                if(err) {
                    bot.log('Redis Connection Error!' + err);
                    bot.respond(message, 'Fehler beim Verbinden zum Redis Server!', true, 10);
                    return message.delete();
                }

                bot.respond(message, `✅ Der Befehl \`${cmdName}\` wurde für ${target} von ${message.author} entsperrt.`);
                bot.log(`!blockcmd: ${message.author.tag} unlocks commands \`${cmdName}\` for ${target.user.tag}.`);
                return message.delete();
            });
        }
    });


};

exports.config = {
    server: true,
    role: roles.moderator,
    trusted: false,
    aliases: ['block', 'bcmd']
};

exports.help = {
    name: 'blockcmd',
    description: 'Befehl für einen Nutzer sperren oder entsperren',
    usage: ['!blockcmd @Discord nsfw', '!blockcmd @Discord np']
};