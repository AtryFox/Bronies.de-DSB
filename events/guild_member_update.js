const roles = require('../config/roles'),
    moment = require('moment');

exports.Event = function(bot) {
    this.bot = bot;
};

exports.run = (oldMember, newMember) => {
    const bot = this.bot;


    if(!bot.checkTrustedMember(oldMember) && bot.checkTrustedMember(newMember)){
        const joinedAt = moment(newMember.joinedAt);

        if(moment().diff(moment(joinedAt).add(7, 'days')) < 0) {
            newMember.removeRole(roles.trusted);
        }
    }
};

exports.config = {
    name: 'guildMemberUpdate',
    enabled: true
};