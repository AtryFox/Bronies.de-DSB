const roles = require('../../config/roles');

exports.config = {
    aliases: ['cena', 'anotha', 'eb', 'stan', 'bday', 'wtc'],
    handled: false,
};

exports.help = {
    name: 'airhorn',
    description: 'Befehl für das Airhorn Soundboard. ([Alle Airhorn Befehle](https://www.reddit.com/r/discordapp/comments/4fuvkd/all_airhornsolution_commands))',
    usage: ['!airhorn', '!cena']
};