const roles = require('../../config/roles'),
    table = require('text-table'),
    moment = require('moment');

moment.locale('de');


exports.run = (bot, message, args) => {
    bot.getInactiveMembers(0, members => {
        let text = '**Folgende Benutzer wurden entfernt:**';

        text += bot.memberCollectionToTable(members);

        bot.splitMessageToMultiple(text).forEach(msg => message.channel.send(msg));

        members.forEach(member => member.kick('Inaktiv seit betreten des Servers.'));
    });
};

exports.config = {
    aliases: ['nrp'],
    server: true,
    role: roles.admin
};

exports.help = {
    name: 'norolesprune',
    description: 'Entfernt Nutzer, die noch nie etwas auf dem Server geschrieben haben',
    usage: ['!norolesprune']
};