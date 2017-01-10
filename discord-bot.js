let Discord = require('discord.js'),
    config = require('./config/config'),
    roles = require('./config/roles'),
    Twitter = require('./modules/twitter').Twitter,
    fs = require('fs'),
    unirest = require('unirest'),
    token = config.TOKEN,
    bot = new Discord.Client(),
    exec = require('child_process').exec,
    moment = require('moment'),
    twitterTimer = null,
    cooldowns = {};

moment.locale('de');

bot.r = require('rethinkdbdash')({host: 'localhost', db: 'bronies_DSB'});

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

bot.log = (msg) => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${msg}`);
};

/* COMMAND LOADER */
let commandLoader = function (currentPath) {
    bot.log("Searching for Commands... " + currentPath);
    let files = fs.readdirSync(currentPath);
    for (let i in files) {
        let currentFile = currentPath + '/' + files[i];
        let stats = fs.statSync(currentFile);
        if (stats.isFile()) {
            let loader = require(`${currentFile}`);
            bot.commands.set(loader.help.name.toLowerCase(), loader);
            if ('aliases' in loader.config) {
                loader.config.aliases.forEach(alias => {
                    bot.aliases.set(alias, loader.help.name);
                });
            }
        } else if (stats.isDirectory()) {
            commandLoader(currentFile);
        }
    }
};
commandLoader('./commands');

/* VERSION */
function getVersion(callback) {
    let info = {};

    exec('git rev-parse --short=4 HEAD', function (error, version) {
        if (error) {
            bot.log('Error getting version', error);
            info.version = 'unknown';
        } else {
            info.version = version.trim();
        }

        exec('git log -1 --pretty=%B', function (error, message) {
            if (error) {
                bot.log('Error getting commit message', error);
            } else {
                info.message = message.trim();
            }

            exec('git log -1 --date=short --pretty=format:%ci', function (error, timestamp) {
                if (error) {
                    console.log('Error getting creation time', error);
                } else {
                    info.timestamp = timestamp;
                }

                callback(info);
            });
        });
    });
}

/* BOT EVENTS */
bot.on('ready', () => {
    online();
    bot.log('I am ready!');
    getVersion((info) => {
        bot.versionInfo = info;
        bot.user.setGame('version ' + bot.versionInfo.version);

        if (config.DEBUG) bot.channels.get(config.BOT_CH).sendMessage('I am ready, running version `' + bot.versionInfo.version + '`! 👌');
    });

    if (!bot.guilds.has(config.SERVER_ID)) {
        bot.log('Bot is not connected to the selected server!');
        process.exit();
    }

    bot.server = bot.guilds.get(config.SERVER_ID);

    if(bot.server.members.has(config.BOT_ADMIN)) {
        bot.admin = bot.server.members.get(config.BOT_ADMIN);
    }

    const twitter = new Twitter(config.TWITTER_API, bot);

    let interval = config.DEBUG ? 20000 : 60000;

    if (twitterTimer != null) {
        clearInterval(twitterTimer);
    }

    twitterTimer = setInterval(() => {
        twitter.postNewTweets();
    }, interval);
});

bot.on('guildMemberAdd', (member) => {
    let embed = new Discord.RichEmbed({
        title: 'Ein neues Mitglied ist zu uns gestoßen!',
        description: `Hey **${member.user.username}**, willkommen auf dem offiziellen Discord Server von [Bronies.de](http://bronies.de/). Wirf doch zunächst einen Blick in **#info** für alle wichtigen Informationen und Bot-Befehle.`,
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_join.png'
        },
        color: 0x5FBB4E
    }).setFooter('Viel Spaß auf dem Server!');

    bot.channels.get(config.DEFAULT_CH).sendEmbed(embed);
});

bot.on('guildMemberRemove', (member) => {
    let embed = new Discord.RichEmbed({
        title: 'Ein Mitglied hat uns verlassen.',
        description: `**${member.user.username}** hat den Server verlassen. Bye bye **${member.user.username}**...`,
        thumbnail: {
            url: 'https://deratrox.de/dev/Bronies.de-DSB/_leave.png'
        },
        color: 0xEC4141
    }).setFooter('DERPY WANTS MUFFINS!');

    bot.channels.get(config.DEFAULT_CH).sendEmbed(embed);
});

bot.on('message', (message) => {
    onMessage(message, false);
});

bot.on('messageUpdate', (oldMessage, newMessage) => {
    if (typeof newMessage.author === 'undefined')
        return;

    onMessage(newMessage, true);
});

function onMessage(message, isUpdate) {
    if (message.author.id == bot.user.id) {
        return;
    }

    if (message.channel.type == 'group') {
        return;
    }

    function handleCommand() {
        let match = /^[\/!]([a-zA-Z]+).*$/.exec(message.content);

        if (message.channel.type == 'dm') {
            match = /^[\/!]?([a-zA-Z]+).*$/.exec(message.content);
        }

        if (match) {

            const args = message.content.split(' ').splice(1);
            let cmd = match[1].toLowerCase();

            let cmdObj = null;

            if (bot.commands.has(cmd)) {
                cmdObj = bot.commands.get(cmd);
            } else if (bot.aliases.has(cmd)) {
                cmdObj = bot.commands.get(bot.aliases.get(cmd));
            }

            if (cmdObj == null) {
                return;
            }
            
            addStats(true);

            if ('handled' in cmdObj.config) {
                if (cmdObj.config.handled == false) {
                    return;
                }
            }

            if ('server' in cmdObj.config) {
                if (cmdObj.config.server == true) {
                    if (message.guild != bot.server) {
                        return bot.respondPm(message, 'Dieser Befehl kann nur auf dem Bronies.de Discord Server ausgeführt werden!');
                    }
                }
            }

            if ('role' in cmdObj.config) {
                if (!bot.checkPermissions(cmdObj.config.role, message.author)) {
                    bot.respondPm(message, 'Du besitzt nicht genügend Rechte um diesen Befehl auszuführen!');
                    if (message.guild == bot.server) {
                        message.delete();
                    }
                    return;
                }
            }

            if ('cooldown' in cmdObj.config) {
                let check = true;

                if ('skip' in cmdObj.config) {
                    if (bot.checkPermissions(cmdObj.config.skip, message.author)) {
                        check = false;
                    }
                }

                if (check) {
                    let cooldown = false;

                    if (cmdObj.config.name in cooldowns) {
                        cooldown = cooldowns[cmdObj.config.name];
                    }

                    if (cooldown) {
                        bot.respondPm(message, 'Dieser Befehl wurde erst vor kurzem ausgeführt. Bitte versuche es später erneut.');
                        if (message.guild == bot.server) {
                            message.delete();
                        }

                        return;
                    }

                    cooldowns[cmdObj.config.name] = true;

                    setTimeout(() => {
                        cooldowns[cmdObj.config.name] = false;
                    }, cmdObj.config.cooldown * 1000);
                }
            }

            cmdObj.run(bot, message, args);
        } else {
            addStats(false);
        }
    }

    function addStats(isCommand) {
        if (isUpdate || (!bot.server.channels.has(message.channel.id) && !isCommand)) return;

        const table = 'stats';
        const addCommand = isCommand ? 1 : 0;
        const addMessage = isCommand ? 0 : 1;
        const date = bot.momentToReDate(moment());


        bot.r.table(table).get(date).run().then(result => {
            if (result == null) {
                const data = {id: date, commands: addCommand, messages: addMessage};

                bot.r.table(table).insert(data).run().then(result => {
                    if (result.errors > 0) {
                        bot.log('Could not insert new date into db: ' + result.first_error);
                    }
                }).error(error => {
                    bot.log('Could not insert new date into db: ' + error);
                });
            } else {
                bot.r.table(table).get(date).update({
                    commands: bot.r.row('commands').add(addCommand),
                    messages: bot.r.row('messages').add(addMessage)
                }).run().then(result => {
                    if (result.errors > 0) {
                        bot.log('Could not update date in db: ' + result.first_error);
                    }
                }).error(error => {
                    bot.log('Could not update date in db: ' + error);
                });
            }
        }).error(error => {
            bot.log('Could not check if current date in db: ' + error);
        });
    }

    if (bot.server.channels.has(message.channel.id)) {
        handleCommand();
    } else {
        if (bot.server.members.has(message.author.id)) {
            handleCommand();
        } else {
            return message.channel.sendMessage('You have to be member of ' + bot.server.name + '!');
        }
    }
}

/* BOT METHODS */

bot.checkPermissions = (role, user) => {
    const member = bot.server.members.get(user.id);

    if (bot.server.owner == member && !config.DEBUG) {
        return true;
    }

    if (!bot.server.roles.exists('name', role)) {
        return false;
    }

    return member.highestRole.comparePositionTo(bot.server.roles.find('name', role)) >= 0;
};

bot.getGuildMember = (user) => {
    return bot.server.members.get(user.id);
};

bot.respond = (message, response, mention) => {
    if (typeof mention === 'undefined') {
        mention = false;
    }

    if (mention) {
        message.reply(response);
    } else {
        message.channel.sendMessage(response);
    }
};

bot.respondPm = (message, response) => {
    message.author.sendMessage(response);
};

bot.getEmoji = (name) => {
    if (bot.server.emojis.exists('name', name)) {
        return bot.server.emojis.find('name', name).toString();
    } else {
        return ':robot:';
    }
};

bot.momentToReDate = (momentObj) => {
    return bot.r.time(momentObj.year(), momentObj.month() + 1, momentObj.date(), 'Z');
};

/* GENERAL APPLICATION STUFF */
process.on('exit', idle);

process.on('SIGINT', () => {
    idle();
    process.exit();

});

function idle() {
    bot.user.setStatus('idle');
}

function online() {
    bot.user.setStatus('online');
}

/* LOGIN */
bot.login(token);
