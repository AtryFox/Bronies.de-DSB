let Discord = require('discord.js'),
    config = require('./config/config'),
    roles = require('./config/roles'),
    Twitter = require('./modules/twitter').Twitter,
    fs = require('fs'),
    unirest = require('unirest'),
    token = config.TOKEN,
    bot = new Discord.Client(),
    server,
    version,
    exec,
    sbBusy = false,
    twitterTimer = null,
    cooldowns = {};

/* VERSION */
function getVersion(callback) {
    exec = exec || require('child_process').exec;

    exec('git rev-parse --short=4 HEAD', function (error, version) {
        if (error) {
            console.log('Error getting version', error);
            return callback('unknown');
        }

        callback(version.trim());
    });
}

/* BOT EVENTS */
bot.on('ready', () => {
    online();
    console.log(getDateTime() + 'I am ready!');
    getVersion((v) => {
        version = v;
        bot.user.setGame('version ' + version);

        if (config.DEBUG) bot.channels.get(config.BOT_CH).sendMessage('I am ready, running version `' + version + '`! 👌');
    });

    if (!bot.guilds.has(config.SERVER_ID)) {
        console.log('Bot is not connected to the selected server!');
        process.exit();
    }

    server = bot.guilds.get(config.SERVER_ID);

    const twitter = new Twitter(config.TWITTER_API, server);

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

function onMessage(message) {
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

            if (!(cmd in commands)) {
                const resolved = resolveAlias(cmd);

                if (!resolved) {
                    return
                } else {
                    cmd = resolved;
                }
            }

            const cmdObj = commands[cmd];

            if ('ignore' in cmdObj) {
                if (cmdObj.ignore == true) {
                    return;
                }
            }

            if ('server' in cmdObj) {
                if (cmdObj.server == true) {
                    if (message.guild != server) {
                        return respondPm(message, 'Dieser Befehl kann nur auf dem Bronies.de Discord Server ausgeführt werden!');
                    }
                }
            }

            if ('role' in cmdObj) {
                if (!checkPermissions(cmdObj.role, message.author)) {
                    respondPm(message, 'Du besitzt nicht genügend Rechte um diesen Befehl auszuführen!');
                    if (message.guild == server) {
                        message.delete();
                    }
                    return;
                }
            }

            if ('cooldown' in cmdObj) {
                let check = true;

                if ('skip' in cmdObj) {
                    if (checkPermissions(cmdObj.skip, message.author)) {
                        check = false;
                    }
                }

                if (check) {
                    let cooldown = false;

                    if (cmd in cooldowns) {
                        cooldown = cooldowns[cmd];
                    }

                    if (cooldown) {
                        respondPm(message, 'Dieser Befehl wurde erst vor kurzem ausgeführt. Bitte versuche es später erneut.');
                        if (message.guild == server) {
                            message.delete();
                        }

                        return;
                    }

                    cooldowns[cmd] = true;

                    setTimeout(() => {
                        cooldowns[cmd] = false;
                    }, cmdObj.cooldown * 1000);
                }
            }

            processCommand(message, cmd, cmdObj, args);
        }
    }

    if (server.channels.has(message.channel.id)) {
        handleCommand();
    } else {
        if (server.members.has(message.author.id)) {
            handleCommand();
        } else {
            return message.channel.sendMessage('You have to be member of ' + server.name + '!');
        }
    }
}

bot.on('message', onMessage);

bot.on('messageUpdate', (oldMessage, newMessage) => {
    if (typeof newMessage.author === 'undefined')
        return;

    onMessage(newMessage);
});

/* PERMISSIONS */
function checkPermissions(role, user) {
    const member = server.members.get(user.id);

    if (server.owner == member) {
        return true;
    }

    if (!server.roles.exists('name', role)) {
        return false;
    }

    return member.highestRole.comparePositionTo(server.roles.find('name', role)) >= 0;
}

function getGuildMember(user) {
    return server.members.get(user.id);
}

function respond(message, response, mention) {
    if (typeof mention === 'undefined') {
        mention = false;
    }

    if (mention) {
        message.reply(response);
    } else {
        message.channel.sendMessage(response);
    }
}

function respondPm(message, response) {
    message.author.sendMessage(response);
}

function getEmoji(name) {
    if (server.emojis.exists('name', name)) {
        return server.emojis.find('name', name).toString();
    } else {
        return ':robot:';
    }
}

function resolveAlias(resolvable) {
    let result = false;

    Object.keys(commands).some((cmd) => {
        const cmdObj = commands[cmd];

        if (!('aliases' in cmdObj)) {
            return false;
        }

        let resolved = false;

        cmdObj.aliases.some((alias) => {
            if (resolvable == alias) {
                resolved = true;
                return true;
            } else {
                return false;
            }
        });

        if (resolved) {
            result = cmd;
            return true;
        } else {
            return false;
        }
    });

    return result;
}

/* COMMAND PROCESSING */
function processCommand(message, cmd, cmdObj, args) {
    switch (cmd) {
        case 'help':
            (() => {
                let text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

                text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

                Object.keys(commands).forEach((command) => {
                    command = commands[command];

                    if ('role' in command) {
                        if (!checkPermissions(command.role, message.author)) {
                            return;
                        }
                    }

                    text += '**`' + command.name + '`**';
                    if ('aliases' in command) {
                        text += ' (alternativ: ';
                        text += '`' + command.aliases.join('`, `');
                        text += '`)';
                    }

                    text += '\n```' + command.help + '```\n\n';
                });

                respondPm(message, text);

                if (message.channel.type == 'text') {
                    message.delete();
                }
            })();
            break;
        case 'version':
            (() => {
                let embed = new Discord.RichEmbed({
                    author: {
                        name: server.name,
                        icon_url: server.iconURL,
                        url: 'http://bronies.de/'
                    },
                    thumbnail: {
                        url: bot.user.avatarURL
                    },
                    title: `DerAtrox/Bronies.de-DSB@` + version,
                    description: 'Umgesetzt mit Hilfe von [Node.js](https://nodejs.org/) und [discord.js](https://discord.js.org/).',
                    fields: [
                        {
                            name: 'Version',
                            value: version,
                            inline: true
                        },
                        {
                            name: 'Letzter Commit',
                            value: 'https://github.com/DerAtrox/Bronies.de-DSB/commit/' + version,
                            inline: true
                        }
                    ],
                    color: 0x632E86
                });

                message.channel.sendEmbed(embed);
            })();
            break;
        case 'nsfw':
            (() => {
                const msg = message;
                message.delete();

                if (args.length != 1) {
                    return respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
                }

                const arg = args[0].toLowerCase();

                const nsfwRole = server.roles.find('name', 'NSFW');
                const member = getGuildMember(msg.author);

                if (arg == 'join') {
                    if (!member.roles.exists('name', 'NSFW')) {
                        member.addRole(nsfwRole);
                        return respondPm(msg, 'Bronies.de NSFW Bereich beigetreten. :smirk:');
                    }
                } else if (arg == 'leave') {
                    if (member.roles.exists('name', 'NSFW')) {
                        member.removeRole(nsfwRole);
                        return respondPm(msg, 'Bronies.de NSFW Bereich verlassen.');
                    }
                } else {
                    return respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
                }
            })();
            break;
        case 'soundboard':
            (() => {
                if (args.length != 1) {
                    respondPm(message, 'Spiele Pony Sounds in deinem aktuellen Voicechannel ab. Nutze `!sb help` um alle Sounds anzuzeigen.\nBeispiel: `!sb lunafun`');
                    return message.delete();
                }

                const arg = args[0].toLowerCase();

                if (arg == 'help') {
                    respondPm(message, 'Folgende Sounds können abgespielt werden:\n```' + Object.keys(sounds).join(' ') + '```');
                    return message.delete();
                } else {
                    if (sbBusy) {
                        return;
                    }

                    const member = getGuildMember(message.author);

                    if (typeof member.voiceChannel == 'undefined') {
                        return;
                    }

                    if (!(arg in sounds)) {
                        return;
                    }

                    const soundPath = './sounds/' + sounds[arg];

                    fs.access(soundPath, fs.constants.R_OK, (err) => {
                        if (!err) {
                            sbBusy = true;
                            member.voiceChannel.join().then((connection) => {
                                const options = {volume: 0.5};
                                const dispatcher = connection.playFile('./sounds/' + sounds[arg], options);

                                dispatcher.on('end', () => {
                                    sbBusy = false;
                                    connection.disconnect();
                                });

                                dispatcher.on('error', (message) => {
                                    console.log(message);
                                });
                            })
                                .catch(console.error);
                        } else {
                            console.log('Soundfile not found: ' + arg + ' file ' + sounds[arg]);
                        }
                    });
                }

            })();
            break;
        case 'derpi':
            (() => {
                if (args.length < 1) {
                    return respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help`');
                }

                let regexOrder = /\bo:(desc|asc)\b/i,
                    regexSort = /\bby:(score|relevance|width|height|comments|random)\b/i,
                    parameters = '',
                    query = args.join(' ');

                if (message.channel == server.channels.find('name', 'nsfw')) {
                    parameters += '&filter_id=134141';
                }

                if (regexOrder.test(query)) {
                    parameters += '&sd=' + query.match(regexOrder)[1];
                    query = query.replace(regexOrder, '');
                }

                if (regexSort.test(query)) {
                    parameters += '&sf=' + query.match(regexSort)[1];
                    query = query.replace(regexSort, '');
                } else {
                    parameters += '&sf=random';
                }

                query = query.replace(/,{2,}/g, ',').replace(/(^,|,$)/, '').replace(/ *, *$/, '');
                const url = 'https://derpibooru.org/search.json?q=' + encodeURIComponent(query) + parameters;
                console.log(message.author.username + '#' + message.author.discriminator + ' - Derpibooru search: ' + url);

                unirest.get(url)
                    .header("Accept", "application/json")
                    .end((result) => {
                        if (result.error || typeof result.body !== 'object') {
                            console.log(result.error, result.body);
                            return respond(message, 'Derpibooru Anfrage fehlgeschlagen (HTTP ' + result.status + ')');
                        }

                        const data = result.body;
                        if (typeof data.search === 'undefined' || typeof data.search[0] === 'undefined')
                            return respond(message, 'Keine Suchergebnisse gefunden.');

                        const img = data.search[0];

                        if (!img.is_rendered) {
                            return respond(message, 'Dieses Bild wurde noch nicht von Derpibooru verarbeitet. Bitte versuche es später erneut.');
                        }

                        respond(message, '<http://derpibooru.org/' + img.id + '>\nhttps:' + (img.image.replace(/__[^.]+(.\w+)$/, '$1')));
                    });


            })();
            break;
        case 'stats':
            (() => {
                const botCount = server.roles.find('name', roles.bot).members.size,
                    memberCount = server.memberCount,
                    onlineCount = server.presences.findAll('status', 'online').length,
                    awayCount = server.presences.findAll('status', 'idle').length,
                    dndCount = server.presences.findAll('status', 'dnd').length,
                    offlineCount = memberCount - onlineCount - awayCount - dndCount;

                let embed = new Discord.RichEmbed({
                    author: {
                        name: server.name,
                        icon_url: server.iconURL,
                        url: 'http://bronies.de/'
                    },
                    thumbnail: {
                        url: server.iconURL
                    },
                    title: `${memberCount} Clients verbunden`,
                    description: `davon ${memberCount - botCount} :busts_in_silhouette: Nutzer und ${botCount} :robot: Bots`,
                    fields: [
                        {
                            name: 'Online',
                            value: onlineCount,
                            inline: true
                        },
                        {
                            name: 'Abwesend',
                            value: awayCount,
                            inline: true
                        },
                        {
                            name: 'Beschäftigt',
                            value: dndCount,
                            inline: true
                        },
                        {
                            name: 'Offline',
                            value: offlineCount,
                            inline: true
                        }
                    ],
                    color: 0xEF7135
                });

                message.channel.sendEmbed(embed);
            })();
            break;
    }
}

const commands = {
    help: {
        name: 'help',
        help: 'Zeigt alle verfügbaren Befehle an.'
    },
    version: {
        name: 'version',
        help: 'Zeigt die verwendete Bronies.de DSB Version an.',
        aliases: ['ver']
    },
    nsfw: {
        name: 'nsfw <join|leave>',
        help: '#nsfw betreten oder verlassen.',
        server: true,
        role: roles.community
    },
    soundboard: {
        name: 'soundboard <sound>',
        help: 'Sound in aktuellem Sprachchannel abspielen. Liste aller Sounds mit !sb help',
        aliases: ['sb'],
        server: true,
        role: roles.community
    },
    derpi: {
        name: 'derpi <search>',
        help: 'Gibt das erste Bild einer Derpibooru Suche zurück.\n\n' +
        'Optionen:\n' +
        ' - Reihenfolge  o:<desc|asc>\n' +
        ' - Sortierung   by:<score|relevance|width|height|comments|random>',
        aliases: ['db'],
        server: true,
        role: roles.community,
        cooldown: 15,
        skip: roles.moderator
    },
    stats: {
        name: 'stats',
        help: 'Zeigt Statistiken zum Server an.',
        aliases: ['st'],
        server: true,
        role: roles.community,
        cooldown: 60,
        skip: roles.moderator
    },
    nowplaying: {
        name: 'nowplaying',
        help: 'Zeigt den aktuell gespielten Track des BRG-Musikbots an.',
        aliases: ['np'],
        ignore: true
    },
    playradio: {
        name: 'playradio',
        help: 'Startet den Radiostream neu.',
        aliases: ['pr'],
        role: roles.community,
        ignore: true
    }
};

const sounds = {
    'lunafun': 'Princess Luna/the fun has been doubled.mp3',
    'eyyup': 'Big Macintosh/eyup.mp3',
    'nope': 'Big Macintosh/nnope.mp3',
    'yeehaw': 'Applejack/yeehaw.mp3',
    'laugh': 'Rainbow Dash/laughing.mp3',
    'catchy': 'Twilight Sparkle/wow catchy.mp3',
    'crazy': 'Twilight Sparkle/are you crazy.mp3',
    'grin': 'Fluttershy/(grin).mp3',
    'choochoo': 'Fluttershy/choo choo train.mp3',
    'yay': 'Fluttershy/yay.mp3',
    'boring': 'Pinkie Pie/boring.mp3',
    'giggle': 'Pinkie Pie/giggle.mp3',
    'oki': 'Pinkie Pie/oki doki loki.mp3',
    'rimshot': 'Pinkie Pie/rimshot.mp3',
    'yeah': 'Snowflake/yeah2.mp3',
    'fanfare': 'Trixie/fanfare.mp3',
    'youmad': 'Zecora/have you gone mad.mp3',
    '10seconds': 'Rainbow Dash/10 seconds flat.mp3',
    'style': 'Pinkie Pie/pinkie pie style.mp3',
    'notcool': 'Rainbow Dash/not cool.mp3',
    'wrong': 'Derpy/i just dont know what went wrong.mp3',
    '20percent': 'Rainbow Dash/it needs to be about 20% cooler.mp3',
    'timecandy': 'Pinkie Pie/time is candy.mp3',
    'awesome': 'Rainbow Dash/so awesome.mp3',
    'louder': 'Rainbow Dash/louder.mp3',
    'trixie': 'Trixie/the g and p t.mp3',
    'swear': 'Pinkie Pie/pinkie pie swear.mp3',
    'shoosh': 'Other/shoosh.mp3',
    'love': 'Fluttershy/youre going to love me.mp3',
    'soos': 'Other/soos.mp3'
};

/* GENERAL APPLICATION STUFF */
process.on('exit', idle);

process.on('SIGINT', () => {
    idle();
    process.exit();

});

function getDateTime() {
    return "[" + new Date().toLocaleString() + "] ";
}

function idle() {
    bot.user.setStatus('idle');
}

function online() {
    bot.user.setStatus('online');
}

/* LOGIN */
bot.login(token);
