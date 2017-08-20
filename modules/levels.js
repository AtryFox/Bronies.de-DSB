function Levels(bot) {
    this.bot = bot;
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

        this.bot.log(newExp);

        this.bot.redis.hset(key, field, newExp, err => {
            if(err) {
                return this.bot.log(`[Levels] Could not giveExp (hset) ${err}`);
            }

            const currentLevel = this.getLevelFromXp(currentExp);
            const newLevel = this.getLevelFromXp(newExp);

            if(currentLevel != newLevel) {
                this.bot.respond(message, `du hast soeben Level ${newLevel} erreicht!`);
            }
        })
    };

    getCurrentExp();
};


if (!(typeof exports === 'undefined')) {
    exports.Levels = Levels;
}
