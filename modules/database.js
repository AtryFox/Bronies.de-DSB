function Database(bot) {
    this.bot = bot;
}

Database.prototype.getLevelXp = function (level) {
    return 5 * (Math.pow(level, 2)) + 50 * level + 100;
};

Database.prototype.getLevelFromXp = function (xp) {
    let level = 0;

    while (xp >= this.getLevelXp(level)) {
        xp -= this.getLevelXp(level);
        level++;
    }

    return level;
};

Database.prototype.getRandomXp = function () {
    return this.bot.randomInt(15, 25);
};

Database.prototype.updateUser = function (user, callback) {
    this.bot.pool.getConnection((error, con) => {
        if (error) {
            this.bot.log(`Could not update user! (DB_CON_FAIL) ${error}`);
            return callback(error);
        }

        const member = this.bot.server.members.get(user.id);

        let data = [user.id, user.username, member.nickname, user.discriminator, user.displayAvatarURL, 0, user.username, member.nickname, user.discriminator, user.displayAvatarURL, 0];

        con.query(`INSERT INTO member (ID, USERNAME, NICKNAME, DISCRIMINATOR, AVATAR, EXP) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE USERNAME = ?, NICKNAME = ?, DISCRIMINATOR = ?, AVATAR = ?, EXP = EXP + ?`, data, (err, results, fields) => {
            con.release();
            if (err) {
                this.bot.log(`Could not update/insert user! ${err}`);
                return callback(err);
            }

            return callback();
        });
    });
};

if (!(typeof exports === 'undefined')) {
    exports.Database = Database;
}
