const roles = require('../../config/roles');

exports.config = {
    aliases: ['np'],
    handled: false
};

exports.help = {
    name: 'nowplaying',
    description: 'Zeigt den aktuell gespielten Track des BRG-Musikbots an.',
    usage: 'nowplaying'
};