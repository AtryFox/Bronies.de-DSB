const Discord = require('discord.js'),
    roles = require('../config/roles'),
    moment = require('moment');

moment.locale('de');

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

    if (message.author.bot) {
        return
    }

    function handleMessage() {
        addStats(false);

        if (!bot.checkPermissions(roles.user, message.author)) {
            bot.getGuildMember(message.author).addRole(bot.server.roles.get(roles.user));
        }

        if (message.content == "" && message.embeds.length > 0) {
            if (!bot.checkPermissions(roles.moderator, message.author) && bot.checkTrusted(message.author)) {
                try {
                    if (message._edits.length == 0) {
                        bot.respond(message, 'Bitte versende keine Selfbot Embeds auf diesem Server!', true, 10);
                        bot.server.channels.get(bot.config.LOG_CH).send(`${moment().format('LLLL')}\n${message.author} sendete ein Embed in ${message.channel.name}. Nachricht wurde entfernt.`);
                        message.delete();
                    }
                } catch (e) {
                    bot.log(`Error removing embed!!\n ${e}`);
                }
            }
        }
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

            const blockCmdKey = `${bot.server.id}.BlockCmd.${message.author.id}`;
            const blockCmdField = `${cmdObj.help.name}`;

            bot.redis.hget(blockCmdKey, blockCmdField, (err, reply) => {
                if (err) {
                    bot.log(`[CheckBlockCmd] Redis Connection Error! ${err}`);
                    handleCommandAfterBlockCheck();
                }

                if (reply == null) {
                    handleCommandAfterBlockCheck();
                } else {
                    bot.respondPm(message, 'Du darfst diesen Befehl nicht ausführen! Wende dich an einen Administrator oder Moderator um mehr Informationen zu erhalten.');

                    if (message.guild == bot.server) {
                        message.delete();
                    }
                }
            });

            function handleCommandAfterBlockCheck() {
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

                let trusted = true;
                if ('trusted' in cmdObj.config) {
                    trusted = cmdObj.config.trusted;
                }

                if (trusted && !bot.checkTrusted(message.author)) {
                    bot.respondPm(message, 'Du musst erst Level 3 erreichen um diesen Befehl nutzen zu können.');

                    if (message.guild == bot.server) {
                        message.delete();
                    }
                    return;
                }

                if ('cooldown' in cmdObj.config) {
                    let check = true;

                    if ('skip' in cmdObj.config) {
                        if (bot.checkPermissions(cmdObj.config.skip, message.author)) {
                            check = false;
                        }
                    }

                    if (check) {
                        let cooldownName = `${message.author.id}.${cmdObj.help.name}`;
                        let globalCooldown = false;

                        if ('global_cooldown' in cmdObj.config) {
                            if (cmdObj.config.global_cooldown) {
                                cooldownName = cmdObj.help.name;
                                globalCooldown = true;
                            }
                        }

                        let cooldown = false;

                        if (cooldownName in bot.cooldowns) {
                            const cooldown = bot.cooldowns[cooldownName];

                            if (moment().diff(cooldown) < 0) {
                                if (globalCooldown) {
                                    bot.respondPm(message, `Der Befehl \`${cmdObj.help.name}\` wurde erst vor kurzem ausgeführt. Bitte warte noch ${moment().to(cooldown, true)}.`);
                                } else {
                                    bot.respondPm(message, `Du hast den Befehl \`${cmdObj.help.name}\` erst vor kurzem ausgeführt. Bitte warte noch ${moment().to(cooldown, true)}.`);
                                }
                                if (message.guild == bot.server) {
                                    message.delete();
                                }

                                return;
                            }
                        }

                        bot.cooldowns[cooldownName] = moment().add(cmdObj.config.cooldown, 'seconds');
                        if (bot.config.DEBUG) bot.log(`Cooldown ${cooldownName} ${bot.cooldowns[cooldownName]}`);
                    }
                }

                cmdObj.run(bot, message, args);
            }
        } else {
            match = /^\/([a-zA-Z]+).*$/.exec(message.content);

            if (match) {
                bot.respondPm(message, 'Befehle können nur noch mit `!` vorangestellt ausgeführt werden. Beispiel: `' + message.content.replace('/', '!') + '`');
                if (message.channel.type != 'dm') {
                    message.delete();
                }
            } else {
                handleMessage();
            }
        }
    }

    function addStats(isCommand) {
        if (isUpdate || !bot.server.channels.has(message.channel.id)) return;

        const addCommand = isCommand ? 1 : 0;
        const addMessage = isCommand ? 0 : 1;


        bot.pool.getConnection((error, con) => {
            if (error) {
                return bot.log(`Could not get connection! ${error}`);
            }

            con.query(`INSERT INTO daily (DATE, MESSAGES, COMMANDS) VALUES (CURDATE(), ${addMessage}, ${addCommand}) ON DUPLICATE KEY UPDATE MESSAGES = MESSAGES + ${addMessage}, COMMANDS = COMMANDS + ${addCommand}`, (err, results, fields) => {
                con.release();
                if (err) {
                    return bot.log(`Could not update/insert stats! ${err}`);
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
            return message.channel.send(`You have to be member of ${bot.server.name}!`);
        }
    }
};

exports.config = {
    name: 'message',
    enabled: true
};