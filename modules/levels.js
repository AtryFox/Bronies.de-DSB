const moment = require('moment');

moment.locale('de');

function Levels(bot) {
    this.bot = bot;

    this.users = {};
}

Levels.prototype.getLevelExp = function (level) {
    return 5 * (Math.pow(level, 2)) + 50 * level + 100;
};

Levels.prototype.getLevelFromExp = function (exp) {
    let level = 0;

    while (exp >= this.getLevelExp(level)) {
        exp -= this.getLevelExp(level);
        level++;
    }

    return level;
};

Levels.prototype.getLevelProgress = function (exp) {
    let level = 0;

    while (exp >= this.getLevelExp(level)) {
        exp -= this.getLevelExp(level);
        level++;
    }

    return exp;
};

Levels.prototype.getRandomExp = function () {
    return this.bot.randomInt(15, 25);
};

Levels.prototype.giveExp = function (message) {
    const key = `${this.bot.server.id}.Levels`;
    const field = message.author.id;

    if (message.author.id in this.users) {
        const timeoutEnd = this.users[message.author.id];

        if (timeoutEnd.diff(moment()) > 0) {
            return;
        }
    }

    let getCurrentExp = () => {
        this.bot.redis.hget(key, field, (err, result) => {
            if (err) {
                return this.bot.log(`[Levels] Could not giveExp (hget) ${err}`);
            }

            let currentExp = 0;

            if (result != null) {
                currentExp = result;
            }

            updateExp(parseInt(currentExp));
        })
    };

    let updateExp = currentExp => {
        const newExp = currentExp + this.getRandomExp();

        this.bot.redis.hset(key, field, newExp, err => {
            if (err) {
                return this.bot.log(`[Levels] Could not giveExp (hset) ${err}`);
            }

            this.users[message.author.id] = moment().add(1, 'm');

            const currentLevel = this.getLevelFromExp(currentExp);
            const newLevel = this.getLevelFromExp(newExp);

            if (currentLevel != newLevel) {
                //this.bot.respond(message, `${message.author}, du hast soeben Level ${newLevel} erreicht!`);
                this.bot.server.channels.get(this.bot.config.TEST_CH).send(`${message.author}, du hast soeben Level ${newLevel} erreicht!`);
            }
        })
    };

    getCurrentExp();
};


Levels.prototype.getExp = function (member, callback) {
    const key = `${this.bot.server.id}.Levels`;
    const field = 'id' in member ? member.id : member;

    this.bot.redis.hget(key, field, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(false, result);
    });
};

Levels.prototype.getAllExp = function (callback) {
    const key = `${this.bot.server.id}.Levels`;

    this.bot.redis.hgetall(key, (err, results) => {
        if (err) {
            return callback(err, null);
        }

        callback(false, results);
    });
};

Levels.prototype.getRanklist = function (callback) {
    this.getAllExp((err, results) => {
        if (err) {
            return callback(err, null);
        }

        let ranks = Object.keys(results).map(function (key) {
            return [key, results[key]];
        });

        ranks.sort(function (first, second) {
            return second[1] - first[1];
        });

        callback(false, ranks);
    });
};

Levels.prototype.setExp = function (member, exp, callback) {
    const key = `${this.bot.server.id}.Levels`;
    const field = 'id' in member ? member.id : member;

    this.bot.redis.hset(key, field, exp, err => {
        if (err) {
            return callback(err);
        }

        callback(false);
    });
};

Levels.prototype.exportLevels = function (callback) {
    this.getAllExp((err, result) => {
        if (err) {
            return callback(err);
        }

        console.log(result);
    })
};


if (!(typeof exports === 'undefined')) {
    exports.Levels = Levels;
}
