const roles = require('../../config/roles'),
    axios = require('axios'),
    moment = require('moment');

moment.locale('de');

exports.run = (bot, message, args) => {
    function getMetaData(callback) {
        axios.get('https://www.bronyradiogermany.com/request-v2/json/v1/history')
            .then((res) => {
                return callback(res.data.result);
            })
            .catch((err) => {
                bot.log(err);
                return callback(false);
            })
    }

    getMetaData(result => {
        if (!result) {
            return bot.respond(message, 'Zulutzt gespielte Songs konnten nicht abgerufen werden. Versuche es bitte später erneut.', true);
        }

        result = result.slice(0, 5);

        let text = '🎶 Zuletzt gespielte Songs im BRG:';

        result.forEach(song => {
            const time = moment(`${song.date_played} ${song.time_played}`, 'DD.MM.YYYY HH:mm:ss');
            text += `\n\n__**${song.title}** von **${song.artist}**__\n${time.fromNow()}`;
        });

        bot.respond(message, text, false);
    })

};

exports.config = {
    aliases: ['lastplayed', 'lp'],
    cooldown: 60,
    global_cooldown: true,
    skip: roles.moderator
};

exports.help = {
    name: 'history',
    description: 'Zeigt die zuletzt gespielten Songs des BRG-Musikbots an.',
    usage: ['!lp']
};