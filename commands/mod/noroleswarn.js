const roles = require('../../config/roles'),
    table = require('text-table'),
    Discord = require('discord.js'),
    moment = require('moment');

moment.locale('de');


exports.run = (bot, message, args) => {
    bot.getInactiveMembers(30, members => {
        let text = '**Folgende Benutzer wurden benachrichtigt:**';

        text += bot.memberCollectionToTable(members);

        bot.splitMessageToMultiple(text).forEach(msg => message.channel.send(msg));

        members.forEach(member => {
            member.send(`Hey, du bist ${moment(member.joinedAt).fromNow()} dem Bronies.de Discord Server beigetreten, hast dich aber leider noch nie zu Wort gemeldet.

Da wir unsere Mitgliederliste aufgeräumt behalten möchten, entfernen wir regelmäßig Mitglieder, die noch nie etwas geschrieben haben.

Du kannst den Server dann jederzeit wieder über den folgenden Link betreten: https://discord.gg/4DX7vqy

Möchtest du auf dem Server bleiben, sag doch einfach mal *Hallo* in der #lobby. 
Alternativ kannst du auch einfach hier mit !community antworten, um nicht von dem Server entfernt zu werden.`)
        });
    });
};

exports.config = {
    aliases: ['nrw'],
    server: true,
    role: roles.admin
};

exports.help = {
    name: 'noroleswarn',
    description: 'Warnt Nutzer, die noch nie etwas auf dem Server geschrieben haben',
    usage: ['!noroleswarn']
};