const Discord = require('discord.js');

exports.Event = function(bot) {
    this.bot = bot;
};

exports.run = (oldMessage, newMessage) => {
    const bot = this.bot;

    if (typeof newMessage.author === 'undefined')
        return;

    bot.events.get('message').onMessage(newMessage, true);
};

exports.config = {
    name: 'messageUpdate',
    enabled: true
};