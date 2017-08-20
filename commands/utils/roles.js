const roles = require('../../config/roles'),
    table = require('text-table');

exports.run = (bot, message, args) => {
    let roleTable = [];

    bot.server.roles.forEach(role => {
        roleTable.push([role.name, role.id, role.members.size + ' members', role.hexColor])
    });

    bot.respond(message, 'Liste aller Rollen des Servers:\n```' + table(roleTable, {hsep: '    '}) + '```');
};

exports.config = {
    aliases: ['r'],
    server: true,
    role: roles.moderator
};

exports.help = {
    name: 'roles',
    description: 'Zeigt alle vorhandenen Rollen des Servers inklusive ihrer IDs an.',
    usage: ['!roles']
};