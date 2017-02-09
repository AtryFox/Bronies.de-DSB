const roles = require('../../config/roles');

exports.config = {
    handled: false,
    role: roles.moderator
};

exports.help = {
    name: 'clear',
    description: 'Löscht die letzten Nachrichten (eines bestimmten Nutzers). Maximal werden 100 Nachrichten entfernt.',
    usage: ['!clear @username', '!clear 20']
};