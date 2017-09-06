const roles = require('../../config/roles'),
    table = require('text-table');

exports.run = (bot, message, args) => {
    const target = bot.getGuildMemberFromArgs(message, args, 0);

    if (target == null) {
        bot.respond(message, `der Nutzer \`${args[0]}\` konnte nicht gefunden werden.`, true, 10);
        return message.delete();
    }

    let exp = args[1];

    if(isNaN(exp)) {
        bot.respond(message, `der angegebene EXP-Wert ist keine Zahl`, true, 10);
        return message.delete();
    }

    exp = parseInt(exp);

    if(exp < 0) {
        bot.respond(message, `der EXP-Wert muss über 0 sein.`, true, 10);
        return message.delete();
    }

    bot.levels.setExp(target, exp, err => {
        if(err) {
            bot.log(`[Levels] SetExp error ${err}`);
            bot.respond(message, `der EXP-Wert konnte nicht gesetzt werden, da ein Fehler aufgetreten ist.`, true, 10);
            return message.delete();
        }

        bot.respond(message, `✅ EXP-Wert für ${target} von ${message.author} auf **${exp}** gesetzt. __Neues Level: ${bot.levels.getLevelFromExp(exp)}__`);
        bot.log(`!setexp: ${message.author.tag} set exp for ${target.user.tag} to ${exp}.`);
        message.delete();
    })
};

exports.config = {
    server: true,
    role: roles.moderator,
    trusted: false,
    params: 2
};

exports.help = {
    name: 'setexp',
    description: 'Setzt die EXP für einen Nutzer.',
    usage: ['!setexp @Discord 500']
};