const roles = require('../../config/roles'),
    fs = require('fs');

let busy = false;

exports.run = (bot, message, args) => {
    if (args.length != 1) {
        bot.respondPm(message, 'Spiele Pony Sounds in deinem aktuellen Voicechannel ab. Nutze `!sb help` um alle Sounds anzuzeigen.\nBeispiel: `!sb lunafun`');
        return message.delete();
    }

    const arg = args[0].toLowerCase();

    if (arg == 'help') {
        bot.respondPm(message, 'Folgende Sounds können abgespielt werden:\n```' + Object.keys(sounds).join(' ') + '```');
        return message.delete();
    } else {
        if (busy) {
            return;
        }

        const member = bot.getGuildMember(message.author);

        if (typeof member.voiceChannel == 'undefined') {
            return;
        }

        if (!(arg in sounds)) {
            return;
        }

        const soundPath = './sounds/' + sounds[arg];

        fs.access(soundPath, fs.constants.R_OK, (err) => {
            if (!err) {
                busy = true;
                member.voiceChannel.join().then((connection) => {
                    const options = {volume: 0.5};
                    const dispatcher = connection.playFile('./sounds/' + sounds[arg], options);

                    dispatcher.on('end', () => {
                        busy = false;
                        connection.disconnect();
                    });

                    dispatcher.on('error', (message) => {
                        bot.log(message);
                    });
                })
                    .catch(console.error);
            } else {
                bot.log('Soundfile not found: ' + arg + ' file ' + sounds[arg]);
            }
        });
    }
};

exports.config = {
    aliases: ['sb'],
    server: true,
    role: roles.community
};

exports.help = {
    name: 'soundboard',
    description: 'Sound in aktuellem Sprachchannel abspielen. Liste aller Sounds mit !sb help',
    usage: 'soundboard <sound>'
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
    'soos': 'Other/soos.mp3',
    'sweep': 'Twilight Sparkle/sweep.mp3',
};