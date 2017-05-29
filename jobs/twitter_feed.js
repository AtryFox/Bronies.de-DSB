const Discord = require('discord.js');

exports.run = (bot) => {
    bot.twitter.postNewTweets();
};

exports.config = {
    name: 'twitter',
    schedule: '* * * * *',
    schedule_dev: '*/20 * * * * *',
    enabled: true
};