const roles = require('../../config/roles');

exports.config = {
    aliases: ['pr'],
    handled: false,
    role: roles.community
};

exports.help = {
    name: 'playradio',
    description: 'Startet den Radiostream neu.',
    usage: ['playradio']
};