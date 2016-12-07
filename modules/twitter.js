var TwitterClient = require('twitter-node-client').Twitter,
    async = require('async');

function Twitter(config, server) {
    this.server = server;
    this.profiles = require('../config/twitter');
    this.init = false;
    this.lastTweets = {};

    var tw_config = {
        'consumerKey': config.CONSUMER_KEY,
        'consumerSecret': config.CONSUMER_SECRET,
        'accessToken': config.ACCESS_TOKEN_KEY,
        'accessTokenSecret': config.ACCESS_TOKEN_SECRET
    };

    this.client = new TwitterClient(tw_config);

    this.initTwitter();
}

Twitter.prototype.initTwitter = function () {
    var parent = this;

    async.each(this.profiles, function (profile, callback) {
        parent.client.getUserTimeline({screen_name: profile.name, count: '1'}, function (err) {
            console.log('Could not initialize twitter for ' + profile.name + "! " + err);
        }, function (data) {
            try {
                var jsonData = JSON.parse(data);
            } catch (err) {
                console.log(err);
                return callback();
            }

            if (jsonData.length < 1) {
                console.log('Could not initialize twitter for ' + profile.name + ', no tweets fetched...');
            } else {
                parent.lastTweets[profile.name] = jsonData[0].id_str;
            }

            callback();
        })
    }, function () {
        parent.init = true;
    });
};

Twitter.prototype.postNewTweets = function () {
    var parent = this;

    if(!this.init) {
        return;
    }

    async.each(parent.profiles, function (profile, callback) {
        if (!(profile.name in parent.lastTweets)) {
            return callback();
        }

        var options = {
            screen_name: profile.name,
            count: '10',
            since_id: parent.lastTweets[profile.name],
            include_rts: profile.rts,
            exclude_replies: !profile.mentions
        };


        parent.client.getUserTimeline(options, function (err) {
            console.log('Could not fetch new tweets for' + profile.name + "! " + err);
        }, function (data) {
            try {
                var jsonData = JSON.parse(data);
            } catch (err) {
                console.log('Could not fetch new tweets for' + profile.name + '! ' + err);
                return callback();
            }

            if (jsonData.length >= 1) {
                parent.lastTweets[profile.name] = jsonData[0].id_str;

                if (!parent.server.channels.exists('id', profile.channel)) {
                    console.log('Could not find channel id ' + profile.channel + ' for ' + profile.name);
                    return callback();
                }

                var channel = parent.server.channels.find('id', profile.channel);

                async.each(jsonData, function (tweet, callback) {
                    channel.sendMessage(':bird: Neuer Tweet von **@' + tweet.user.screen_name + '**: <https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '>```' + tweet.text + '```');
                    callback();
                });
            }

            callback();
        })
    });
};

if (!(typeof exports === 'undefined')) {
    exports.Twitter = Twitter;
}
