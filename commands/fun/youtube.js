const roles = require('../../config/roles');


exports.run = (bot, message, args) => {
    if (args.length < 1) {
        return bot.respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help youtube`');
    }

    bot.youtube.searchVideo(args.join(' '), result => {
        let text = '';

        if (!result) {
            text = 'Keine Suchergebnisse auf **YouTube** gefunden.';
        } else {
            text = `**${result.snippet.title}** von **${result.snippet.channelTitle}**\n\nhttps://www.youtube.com/watch?v=${result.id.videoId}`;
        }

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
    description: 'Gibt das erste Ergebnis einer Suche auf YouTube zurück.',
    usage: ['!youtube Rainbow Dash', '!yt pony', '!yt boop']
};