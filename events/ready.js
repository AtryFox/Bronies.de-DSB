exports.Event = function(bot) {
  this.bot = bot;
};

exports.run = () => {
    const bot = this.bot;

    bot.online();

    bot.log('I am ready!');
    bot.getVersion((info) => {
        bot.versionInfo = info;
        //bot.user.setGame('version ' + bot.versionInfo.version);
        bot.user.setPresence({ game: { name: 'version ' + bot.versionInfo.version, type: 0 } });

        if (bot.config.DEBUG) bot.channels.get(bot.config.BOT_CH).send('I am ready, running version `' + bot.versionInfo.version + '`! 👌');
    });

    if (!bot.guilds.has(bot.config.SERVER_ID)) {
        bot.log('Bot is not connected to the selected server!');
        process.exit();
    }

    bot.server = bot.guilds.get(bot.config.SERVER_ID);

    if (bot.server.members.has(bot.config.BOT_ADMIN)) {
        bot.admin = bot.server.members.get(bot.config.BOT_ADMIN);
    }
};

exports.config = {
    name: 'ready',
    enabled: true
};