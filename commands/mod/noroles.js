const roles = require('../../config/roles'),
    table = require('text-table'),
    Discord = require('discord.js'),
    moment = require('moment');

moment.locale('de');


exports.run = (bot, message, args) => {
    let text = '**Nutzer ohne Rollen:**';


    let tableContent = ['Tag', 'ID', 'Joined', '-----', '------------------', '------------------'];

    bot.server.fetchMembers().then(guild => {
        guild.members.filter(member => {
            return member.roles.size <= 1;
        }).sort((a, b) => {
            return moment(a.joinedAt) - moment(b.joinedAt);
        }).forEach(member => {
            tableContent.push(member.user.tag, member.id, `${moment(member.joinedAt).format('L LT')} (${moment(member.joinedAt).fromNow()})`);
        });

        let commandsTable = [],
            columns = 3;
        for (let ix = 0; ix < tableContent.length; ix += columns)
            commandsTable.push(tableContent.slice(ix, ix + columns));

        text += '```' + table(commandsTable, {hsep: '    '}) + '```';

        console.log(text);
        message.channel.send(text);
    });
};

exports.config = {
    aliases: ['nr'],
    server: true,
    role: roles.moderator
};

exports.help = {
    name: 'noroles',
    description: 'Zeigt alle Mitglieder des Servers ohne Rolle an.',
    usage: ['!noroles']
};