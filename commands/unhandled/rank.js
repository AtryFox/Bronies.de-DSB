const roles = require('../../config/roles');

exports.config = {
    handled: false,
    trusted: false
};

exports.help = {
    name: 'rank',
    description: 'Zeigt euren Rang anhand eurer Aktivität auf dem Server an.',
    usage: ['!rank']
};