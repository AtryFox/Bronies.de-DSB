const roles = require('../../config/roles'),
    YouTube = require('youtube-node');

exports.run = (bot, message, args) => {
    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help youtube`');
    }

    const yt = new YouTube();

    yt.setKey(bot.config.YOUTUBE_KEY);

    yt.addParam('type', 'video');
    yt.search(args.join(' '), 1, (error, result) => {
        let text = '';
        let video = false;

        if (error) {
            console.log(error);
        } else {
            if (result.items.length == 1) {
                text += `**${result.items[0].snippet.title}** von **${result.items[0].snippet.channelTitle}**\n\nhttps://www.youtube.com/watch?v=${result.items[0].id.videoId}`;
                if (bot.config.DEBUG) console.log(JSON.stringify(result, null, 2));

                video = true;
            }
        }

        if(!video) text = 'Keine Suchergebnisse auf **YouTube** gefunden.';

        return bot.respond(message, text, false);
    });
};

exports.config = {
    aliases: ['yt'],
    server: true,
    role: roles.community,
    cooldown: 15,
    skip: roles.moderator
};

exports.help = {
    name: 'youtube',
    description: 'Gibt das erste Ergebnis einer Suche auf YouTube zurück',
    usage: ['!youtube Rainbow Dash', '!yt pony', '!yt YouTube Kacke']
};