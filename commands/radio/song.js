const roles = require('../../config/roles'),
    axios = require('axios');

exports.run = (bot, message, args) => {
    function getMetaData(callback) {
        axios.get('https://www.bronyradiogermany.com/request-v2/json/v1/nowplaying/stream')
            .then((res) => {
                return callback(res.data.result);
            })
            .catch((err) => {
                bot.log(err);
                return callback(false);
            })
    }

    getMetaData(result => {
        let success = true;

        if (!result) {
            result = {};

            if (bot.server.members.has(bot.config.RADIO_BOT)) {
                const np = bot.server.members.get(bot.config.RADIO_BOT).user.presence.game;

                const npS = np.split(' - ');

                if (npS.length == 2) {
                    result.title = npS[1];
                    result.artist = npS[0];
                } else {
                    result.title = np;
                }
            } else {
                success = false;
            }
        }

        if (!success) {
            return bot.respond(message, 'Aktueller Song konnte nicht abgerufen werden.', true);
        }

        let songString, searchQuery;

        if ('artist' in result) {
            songString = `**${result.title}** von **${result.artist}**`;
            searchQuery = result.title + ' ' + result.artist;
        } else {
            songString = result.title;
            searchQuery = result.title;
        }

        let text = `🎶 Derzeit läuft ${songString} im BRG.`;
        let info = '';

        if ('current_event' in result) {
            let preString;

            if (result.current_event == 'DJ-Pony Lucy') {
                preString = bot.getEmoji('brgLucy') + ' **DJ-Pony Lucy**';
            } else if (result.current_event == 'DJ-Pony Mary') {
                preString = bot.getEmoji('brgMary') + ' **DJ-Pony Mary**';
            } else {
                preString = `🔴 **${result.current_event}**`;
            }

            const listenerString = result.listener == 1 ? 'Zuhörer' : 'Zuhörern';

            text += `\n${preString} mit ${result.listener} ${listenerString}.`;

            const votes = result.upvotes - result.downvotes;
            const votesEmote = votes >= 0 ? '❤' : '💔';

            info = `${votes} ${votesEmote}`;
        }

        bot.youtube.searchVideo(searchQuery, video => {
            if (video) {
                if (info != '') {
                    info += ' | ';
                }

                info += 'Auf YouTube anhören:  https://youtu.be/' + video.id.videoId;
            }

            if (info != '') {
                text += '\n\n' + info;
            }

            bot.respond(message, text, false);
        });

    })

};

exports.config = {
    aliases: ['nowplaying', 'np'],
    role: roles.user,
    cooldown: 60,
    skip: roles.moderator
};

exports.help = {
    name: 'song',
    description: 'Zeigt den aktuell gespielten Track des BRG-Musikbots an.',
    usage: ['!np']
};