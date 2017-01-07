const roles = require('../../config/roles');

exports.config = {
    aliases: ['rv'],
    handled: false
};

exports.help = {
    name: 'radio',
    description: 'Zeigt die aktuelle Version des Radio-Bots an.',
    usage: ['!radio']
};