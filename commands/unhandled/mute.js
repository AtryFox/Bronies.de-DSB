const roles = require('../../config/roles');

exports.config = {
    handled: false,
    aliases: ['unmute'],
    role: roles.moderator
};

exports.help = {
    name: 'mute',
    description: 'Schaltet einen Nutzer im aktuelle Channel stumm. `!unmute` zum reaktivieren.',
    usage: ['!mute @username', '!unmute @username']
};