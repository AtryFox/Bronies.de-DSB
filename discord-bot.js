var Discord = require('discord.js'),
    config = require('./config'),
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
    console.log('I am ready!');
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

            processCommand(message, match[1].toLowerCase(), args);
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
function Permission(checker) {
    return {
        check: function (user) {
            if (!server.members.exists('id', user.id)) {
                return false;
            }

            var member = server.members.find('id', user.id);

            return checker(member);
        }
    };
}

var isAdmin = new Permission(function (member) {
    return member.roles.exists('name', 'Admin') || member.roles.exists('name', 'Co-Admin');
});

var isMod = new Permission(function (member) {
    return isAdmin.check(member) ? true : member.roles.exists('name', 'Moderator');
});

var isUser = new Permission(function (member) {
    return isMod.check(member) ? true : member.roles.exists('name', '⬛ Community');
});

function getGuildMemeber(user) {
    return server.members.find('id', user.id);
}

function respond(message, response, pm) {
    if (typeof pm === 'undefined') {
        pm = false;
    }

    if (pm) {
        message.author.sendMessage(response);
    } else {
        message.reply(response);
    }
}

/* COMMAND PROCESSING */
function processCommand(message, command, args) {
    switch (command) {
        case 'help':
            (function () {
                var text = '\n\nBefehle müssen `/` oder `!` vorangestellt haben. Groß- und Kleinschreibung wird nicht beachtet.\nIn PMs wird kein Präfix benötigt.\n\n';

                text += 'Liste aller Befehle, die **du** nutzen kannst:\n\n';

                commands.forEach(function (command) {
                    if (command.role == "Admin") {
                        if (!isAdmin.check(message.author)) {
                            return;
                        }
                    } else if (command.role == "Moderator") {
                        if (!isMod.check(message.author)) {
                            return;
                        }
                    } else if (command.role == "Community") {
                        if (!isUser.check(message.author)) {
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

                respond(message, text, true);
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
                if (message.guild != server) {
                    return respond(message, 'Dieser Befehl kann nur auf dem Bronies.de Discord Server ausgeführt werden!', true);
                }

                var msg = message;
                message.delete();

                if (!isUser.check(msg.author)) {
                    return respond(msg, 'Du besitzt nicht genügend Rechte!', true);
                }

                if (args.length != 1) {
                    return respond(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen.\nBeispiel: `!nsfw join`', true);
                }

                var arg = args[0].toLowerCase();

                var nsfwRole = server.roles.find('name', 'NSFW');
                var member = getGuildMemeber(msg.author);

                if (arg == 'join') {
                    if (member.roles.exists('name', 'NSFW')) {
                        return respond(msg, 'Du hast bereits Zugriff auf den NSFW Bereich.', true);
                    } else {
                        member.addRole(nsfwRole);
                        return respond(msg, 'Bronies.de NSFW Bereich beigetreten. :smirk:', true);
                    }
                } else if (arg == 'leave') {
                    if (!member.roles.exists('name', 'NSFW')) {
                        return respond(msg, 'Du hast bereits keinen Zugriff auf den NSFW Bereich.', true);
                    } else {
                        member.removeRole(nsfwRole);
                        return respond(msg, 'Bronies.de NSFW Bereich verlassen.', true);
                    }
                } else {
                    return respond(msg, 'Nutze `!nsfw <join|leave>` um den NSFW Bereich zu betreten bzw. zu verlassen.\nBeispiel: `!nsfw join`', true);
                }
            })();
            break;
        case 'soundboard':
        case 'sb':
            (function () {
                if (message.guild != server) {
                    return respond(message, 'Dieser Befehl kann nur auf dem Bronies.de Discord Server ausgeführt werden!', true);
                    message.delete();
                }

                if (!isUser.check(message.author)) {
                    return respond(message, 'Du besitzt nicht genügend Rechte!', true);
                    message.delete();
                }

                if (args.length != 1) {
                    return respond(message, 'Spiele Pony Sounds in deinem aktuellen Voicechannel ab. Nutze `!sb help` um alle Sounds anzuzeigen.\nBeispiel: `!sb lunafun`', true);
                    message.delete();
                }

                var arg = args[0].toLowerCase();


                if (arg == 'help') {
                    respond(message, 'Folgende Sounds können abgespielt werden:\n```' + Object.keys(sounds).join(' ') + '```', true);
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

                    var fs = require('fs');
                    var soundPath = './sounds/' + sounds[arg];

                    fs.access(soundPath, fs.constants.R_OK, function(err) {
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
    }
}

var commands = [
    {
        name: 'help',
        help: 'Zeigt alle verfügbaren Befehle an.'
    },
    {
        name: 'version',
        help: 'Zeigt die verwendete Bronies.de DSB Version an.',
        aliases: ['ver']
    },
    {
        name: 'nsfw <join|leave>',
        help: '#nsfw betreten oder verlassen.',
        role: 'Community'
    },
    {
        name: 'soundboard <sound>',
        help: 'Sound in aktuellem Sprachchannel abspielen. Liste aller Sounds mit !sb help',
        aliases: ['sb'],
        role: 'Community'
    },
    {
        name: 'nowplaying',
        help: 'Zeigt den aktuell gespielten Track des BRG-Musikbots an.',
        aliases: ['np']
    }
];

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
    'youmad': 'Zecora/have you gone mad.mp3'
};

/* GENERAL APPLICATION STUFF */
process.on('exit', idle);

process.on('SIGINT', function () {
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

