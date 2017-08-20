const moment = require('moment');

moment.locale('de');

function Levels(bot) {
    this.bot = bot;

    this.users = {};
}

Levels.prototype.getLevelExp = function (level) {
    return 5 * (Math.pow(level, 2)) + 50 * level + 100;
};

Levels.prototype.getLevelFromXp = function (xp) {
    let level = 0;

    while (xp >= this.getLevelExp(level)) {
        xp -= this.getLevelExp(level);
        level++;
    }

    return level;
};

Levels.prototype.getRandomExp = function () {
    return this.bot.randomInt(15, 25);
};

Levels.prototype.giveExp = function (message) {
    const key = `${this.bot.server.id}.Levels`;
    const field = message.author.id;

    if(message.author.id in this.users) {
        const timeoutEnd = this.users[message.author.id];

        if(timeoutEnd.diff(moment()) > 0) {
            return;
        }
    }

    let getCurrentExp = () => {
        this.bot.redis.hget(key, field, (err, result) => {
            if(err) {
                return this.bot.log(`[Levels] Could not giveExp (hget) ${err}`);
            }

            let currentExp = 0;

            if(result != null) {
                currentExp = result;
            }

            updateExp(parseInt(currentExp));
        })
    };

    let updateExp = currentExp => {
        const newExp = currentExp + this.getRandomExp();

        this.bot.redis.hset(key, field, newExp, err => {
            if(err) {
                return this.bot.log(`[Levels] Could not giveExp (hset) ${err}`);
            }

            this.users[message.author.id] = moment().add(1, 'm');

            const currentLevel = this.getLevelFromXp(currentExp);
            const newLevel = this.getLevelFromXp(newExp);

            if(currentLevel != newLevel) {
                this.bot.respond(message, `du hast soeben Level ${newLevel} erreicht!`);
            }
        })
    };

    getCurrentExp();
};

Levels.prototype.setExp = function (member, exp, callback) {
    const key = `${this.bot.server.id}.Levels`;
    const field = member.id;

    this.bot.redis.hset(key, field, exp, err => {
        if(err) {
            return callback(err);
        }

        callback(false);
    })
};


if (!(typeof exports === 'undefined')) {
    exports.Levels = Levels;
}
