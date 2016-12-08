var Discord = require('discord.js'),
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
    sbbusy = false;

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
bot.on('ready', function () {
    online();
    console.log(getDateTime() + 'I am ready!');
    getVersion(function (v) {
        version = v;
        bot.user.setGame('version ' + version);

        if (config.DEBUG) bot.channels.find('id', config.BOT_CH).sendMessage('I am ready, running version `' + version + '`! 👌');
    });

    if (!bot.guilds.exists('id', config.SERVER_ID)) {
        console.log('Bot is not connected to the selected server!');
        process.exit();
    }

    server = bot.guilds.find('id', config.SERVER_ID);

    var twitter = new Twitter(config.TWITTER_API, server);

    setInterval(function () {
        twitter.postNewTweets();
    }, 60000 * 5);
});

bot.on('guildMemberAdd', function (member) {
    //bot.channels.find('id', config.DEFAULT_CH).sendMessage(member + ' Willkommen auf dem offiziellen Discord Server von Bronies.de ... Wirf doch für den Anfang einen Blick in den #info Bereich. :lyra_1:');
});

function onMessage(message) {
    if (message.author.id == bot.user.id) {
        return;
    }

    if (message.channel.type == 'group') {
        return;
    }

    function handleCommand() {
        var match = /^[\/!]([a-zA-Z]+).*$/.exec(message.content);

        if (message.channel.type == 'dm') {
            match = /^[\/!]?([a-zA-Z]+).*$/.exec(message.content);
        }

        if (match) {
            var args = message.content.split(' ').splice(1);
            var cmd = match[1].toLowerCase();

            if (!(cmd in commands)) {
                return;
            }

            var cmdObj = commands[cmd];

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
                    return respond(message, 'Du besitzt nicht genügend Rechte um diesen Befehl auszuführen!', true);
                }
            }

            processCommand(message, cmd, cmdObj, args);
        }
    }

    if (server.channels.exists('id', message.channel.id)) {
        handleCommand();
    } else {
        if (server.members.exists('id', message.author.id)) {
            handleCommand();
        } else {
            return message.channel.sendMessage('You have to be member of ' + server.name + '!');
        }
    }
}

bot.on('message', onMessage);

bot.on('messageUpdate', function (oldMessage, newMessage) {
    if (typeof newMessage.author === 'undefined')
        return;

    onMessage(newMessage);
});

/* PERMISSIONS */
function checkPermissions(role, user) {
    var member = server.members.find('id', user.id);

    if (server.owner == member) {
        //return true;
    }

    if (!server.roles.exists('name', role)) {
        return false;
    }

    return member.highestRole.comparePositionTo(server.roles.find('name', role)) >= 0;
}

function getGuildMemeber(user) {
    return server.members.find('id', user.id);
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

/* COMMAND PROCESSING */
function processCommand(message, cmd, cmdObj, args) {
    switch (cmd) {
        case 'help':
            (function () {
                var text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

                text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

                Object.keys(commands).forEach(function (command) {
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
        case 'ver':
        case 'version':
            (function () {
                respond(message, "Bronies.de DSB version `" + version + "`.\nAktuellster Commit: https://github.com/DerAtrox/Bronies.de-DSB/commit/" + version);
            })();
            break;
        case 'nsfw':
            (function () {
                var msg = message;
                message.delete();

                if (args.length != 1) {
                    return respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
                }

                var arg = args[0].toLowerCase();

                var nsfwRole = server.roles.find('name', 'NSFW');
                var member = getGuildMemeber(msg.author);

                if (arg == 'join') {
                    if (member.roles.exists('name', 'NSFW')) {
                        return;
                    } else {
                        member.addRole(nsfwRole);
                        return respondPm(msg, 'Bronies.de NSFW Bereich beigetreten. :smirk:');
                    }
                } else if (arg == 'leave') {
                    if (!member.roles.exists('name', 'NSFW')) {
                        return;
                    } else {
                        member.removeRole(nsfwRole);
                        return respondPm(msg, 'Bronies.de NSFW Bereich verlassen.');
                    }
                } else {
                    return respondPm(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen. Beispiel: `!nsfw join`');
                }
            })();
            break;
        case 'soundboard':
        case 'sb':
            (function () {
                if (args.length != 1) {
                    return respondPm(message, 'Spiele Pony Sounds in deinem aktuellen Voicechannel ab. Nutze `!sb help` um alle Sounds anzuzeigen.\nBeispiel: `!sb lunafun`');
                    message.delete();
                }

                var arg = args[0].toLowerCase();

                if (arg == 'help') {
                    respondPm(message, 'Folgende Sounds können abgespielt werden:\n```' + Object.keys(sounds).join(' ') + '```');
                    return message.delete();
                } else {
                    if (sbbusy) {
                        return;
                    }

                    var member = getGuildMemeber(message.author);

                    if (typeof member.voiceChannel == 'undefined') {
                        return;
                    }

                    if (!(arg in sounds)) {
                        return;
                    }

                    var soundPath = './sounds/' + sounds[arg];

                    fs.access(soundPath, fs.constants.R_OK, function (err) {
                        if (!err) {
                            sbbusy = true;
                            member.voiceChannel.join().then(function (connection) {
                                const dispatcher = connection.playFile('./sounds/' + sounds[arg]);

                                dispatcher.on('end', function () {
                                    sbbusy = false;
                                    connection.disconnect();

                                });

                                dispatcher.on('error', function (message) {
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
        case 'db':
            (function () {
                if (args.length < 1) {
                    return respond(message, 'Dieser Befehl benötigt zusätzliche Parameter. Mehr unter `!help`');
                }

                var regexOrder = /\bo:(desc|asc)\b/i,
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

                query = query.replace(/,{2,}/g, ',').replace(/(^,|,$)/, '');
                var url = 'https://derpibooru.org/search.json?q=' + encodeURIComponent(query) + parameters;
                console.log(message.author.username + '#' + message.author.discriminator + ' - Derpibooru search: ' + url);

                unirest.get(url)
                    .header("Accept", "application/json")
                    .end(function (result) {
                        if (result.error || typeof result.body !== 'object') {
                            console.log(result.error, result.body);
                            return respond(message, 'Derpibooru Anfrage fehlgeschlagen (HTTP ' + result.status + ')');
                        }

                        var data = result.body;
                        if (typeof data.search === 'undefined' || typeof data.search[0] === 'undefined')
                            return respond(message, 'Keine Suchergebnisse gefunden.');

                        var img = data.search[0];

                        if (!img.is_rendered) {
                            return respond(message, 'Dieses Bild wurde noch nicht von Derpibooru verarbeitet. Bitte versuche es später erneut.');
                        }

                        respond(message, '<http://derpibooru.org/' + img.id + '>\nhttps:' + (img.image.replace(/__[^.]+(.\w+)$/, '$1')));
                    });


            })();
            break;
    }
}

var commands = {
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
        role: roles.community
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
        role: roles.brgteam,
        ignore: true
    }
};

var sounds = {
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
    'wrong': 'Derpy/i just dont know what went wrong.mp3'
};

/* GENERAL APPLICATION STUFF */
process.on('exit', idle);

process.on('SIGINT', function () {
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