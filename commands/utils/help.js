const roles = require('../../config/roles');

exports.run = (bot, message, args) => {
    let text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

    text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

    bot.commands.forEach(command => {
        if ('role' in command.config) {
            if (!bot.checkPermissions(command.config.role, message.author)) {
                return;
            }
        }

        text += '**`' + command.help.name + '`**';
        if ('aliases' in command.config) {
            text += ' (alternativ: ';
            text += '`' + command.config.aliases.join('`, `');
            text += '`)';
        }

        text += '\n```' + command.help.description + '```\n\n';
    });

    bot.respondPm(message, text);

    if (message.channel.type == 'text') {
        message.delete();
    }
};

exports.config = { };

exports.help = {
    name: 'help',
    description: 'Zeigt alle verfügbaren Befehle an.',
    usage: 'help'
};