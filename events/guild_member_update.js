const roles = require('../config/roles'),
    moment = require('moment');

exports.Event = function (bot) {
    this.bot = bot;
};

exports.run = (oldMember, newMember) => {
    const bot = this.bot;

    const oldTrustStatus = bot.checkTrustedMember(oldMember);
    const newTrustStatus = bot.checkTrustedMember(newMember);

    if ((!oldTrustStatus && newTrustStatus) || (oldTrustStatus && !newTrustStatus)) {
        const key = `${bot.server.id}.TrustStatus`;
        const field = `${oldMember.id}`;

        bot.redis.hget(key, field, (err, reply) => {
            if (err) {
                return bot.log('[CheckTrustStatus] Redis Connection Error ' + err);
            }

            if (reply == null) {
                const joinedAt = moment(newMember.joinedAt);

                if (moment().diff(moment(joinedAt).add(3, 'days')) < 0) {
                    newMember.removeRole(roles.trusted);
                }
            } else if (reply == 1) {
                newMember.addRole(roles.trusted);
            } else if (reply == 2) {
                newMember.removeRole(roles.trusted);
            }
        });
    }
};

exports.config = {
    name: 'guildMemberUpdate',
    enabled: true
};