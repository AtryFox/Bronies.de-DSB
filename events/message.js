const Discord = require('discord.js');

exports.Event = function (bot) {
    this.bot = bot;
};

exports.run = (message) => {
    this.onMessage(message, false);
};

exports.onMessage = (message, isUpdate) => {
    const bot = this.bot;

    if (message.author.id == bot.user.id) {
        return;
    }

    if (message.channel.type == 'group') {
        return;
    }

    function handleCommand() {
        let match = /^!([a-zA-Z]+).*/.exec(message.content);

        if (message.channel.type == 'dm') {
            match = /^!?([a-zA-Z]+).*/.exec(message.content);
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

                    if (cmdObj.help.name in bot.cooldowns) {
                        cooldown = bot.cooldowns[cmdObj.help.name];
                    }

                    if (cooldown) {
                        bot.respondPm(message, 'Dieser Befehl wurde erst vor kurzem ausgeführt. Bitte versuche es später erneut.');
                        if (message.guild == bot.server) {
                            message.delete();
                        }

                        return;
                    }

                    bot.cooldowns[cmdObj.help.name] = true;
                    if(bot.config.DEBUG) bot.log("Cooldown " + cmdObj.help.name);

                    setTimeout(() => {
                        bot.cooldowns[cmdObj.help.name] = false;
                        if(bot.config.DEBUG) bot.log("Cooldown END " + cmdObj.help.name);
                    }, cmdObj.config.cooldown * 1000);
                }
            }

            cmdObj.run(bot, message, args);
        } else {
            match = /^\/([a-zA-Z]+).*$/.exec(message.content);

            if (match) {
                bot.respondPm(message, 'Befehle können nur noch mit `!` vorangestellt ausgeführt werden. Beispiel: `' + message.content.replace('/', '!') + '`');
                if (message.channel.type != 'dm') {
                    message.delete();
                }
            } else {
                addStats(false);
            }
        }
    }

    function addStats(isCommand) {
        if (isUpdate || !bot.server.channels.has(message.channel.id)) return;

        const addCommand = isCommand ? 1 : 0;
        const addMessage = isCommand ? 0 : 1;


        bot.pool.getConnection((error, con) => {
            if (error) {
                return bot.log('Could not get connection! ' + error);
            }

            con.query(`INSERT INTO daily (DATE, MESSAGES, COMMANDS) VALUES (CURDATE(), ${addMessage}, ${addCommand}) ON DUPLICATE KEY UPDATE MESSAGES = MESSAGES + ${addMessage}, COMMANDS = COMMANDS + ${addCommand}`, (err, results, fields) => {
                con.release();
                if (err) {
                    return bot.log('Could not update/insert stats! ' + err);
                }
            });
        });
    }

    if (bot.server.channels.has(message.channel.id)) {
        handleCommand();
    } else {
        if (bot.server.members.has(message.author.id)) {
            handleCommand();
        } else {
            return message.channel.send('You have to be member of ' + bot.server.name + '!');
        }
    }
};

exports.config = {
    name: 'message',
    enabled: true
};