function Database(bot) {
    this.bot = bot;
}

Database.prototype.updateUser = function (user, exp, callback) {
    this.bot.pool.getConnection((error, con) => {
        if (error) {
            this.bot.log('Could not update user! (DB_CON_FAIL) ' + error);
            return callback(error);
        }

        const member = this.bot.server.members.get(user.id);

        let data = [user.id, user.username, member.nickname, user.discriminator, user.displayAvatarURL, exp, user.username, member.nickname, user.discriminator, user.displayAvatarURL, exp];

        console.log(user.displayAvatarURL);

        con.query(`INSERT INTO member (ID, USERNAME, NICKNAME, DISCRIMINATOR, AVATAR, EXP) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE USERNAME = ?, NICKNAME = ?, DISCRIMINATOR = ?, AVATAR = ?, EXP = EXP + ?`, data, (err, results, fields) => {
            con.release();
            if (err) {
                this.bot.log('Could not update/insert user! ' + err);
                return callback(err);
            }

            return callback();
        });
    });
};

if (!(typeof exports === 'undefined')) {
    exports.Database = Database;
}
