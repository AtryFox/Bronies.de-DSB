let TwitterClient = require('twitter-node-client').Twitter,
    async = require('async');

function Twitter(config, server) {
    this.server = server;
    this.profiles = require('../config/twitter');
    this.init = false;
    this.lastTweets = {};

    const tw_config = {
        'consumerKey': config.CONSUMER_KEY,
        'consumerSecret': config.CONSUMER_SECRET,
        'accessToken': config.ACCESS_TOKEN_KEY,
        'accessTokenSecret': config.ACCESS_TOKEN_SECRET
    };

    this.client = new TwitterClient(tw_config);

    this.initTwitter();
}

Twitter.prototype.initTwitter = function () {
    const parent = this;

    async.each(this.profiles, function (profile, callback) {
        parent.client.getUserTimeline({screen_name: profile.name, count: '1'}, function (err) {
            console.log('Could not initialize twitter for ' + profile.name + "! " + err);
        }, function (data) {
            let jsonData;
            try {
                jsonData = JSON.parse(data);
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
    const parent = this;

    if (!this.init) {
        return;
    }

    async.each(parent.profiles, function (profile, callback) {
        if (!(profile.name in parent.lastTweets)) {
            return callback();
        }

        const options = {
            screen_name: profile.name,
            count: '10',
            since_id: parent.lastTweets[profile.name],
            include_rts: profile.rts,
            exclude_replies: !profile.mentions
        };

        parent.client.getUserTimeline(options, function (err) {
            console.log('Could not fetch new tweets for' + profile.name + "! " + err);
        }, function (data) {
            let jsonData;

            try {
                jsonData = JSON.parse(data);
            } catch (err) {
                console.log('Could not fetch new tweets for' + profile.name + '! ' + err);
                return callback();
            }

            if (jsonData.length >= 1) {
                parent.lastTweets[profile.name] = jsonData[0].id_str;

                if (!parent.server.channels.has(profile.channel)) {
                    console.log('Could not find channel id ' + profile.channel + ' for ' + profile.name);
                    return callback();
                }

                const channel = parent.server.channels.get(profile.channel);

                async.each(jsonData, function (tweet, callback) {
                    let urls = '';

                    if (tweet.entities.urls.length > 0) {
                        const urlData = tweet.entities.urls.map(function (a) {
                            return a.expanded_url;
                        });

                        urls = '\n:link: Weitere Links aus dem Tweet: <' + urlData.join('>, <') + '>';
                    }

                    channel.sendMessage(':bird: Neuer Tweet von **`@' + tweet.user.screen_name + '` (' + tweet.user.name + ')** | <https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '>\n' + urls + '\n```' + tweet.text + '```');
                    callback();
                });
            }

            callback();
        });
    });
};

Twitter.prototype.getTestTweet = function (user, rts, mentions) {
    const parent = this;

    rts = rts || true;
    mentions = mentions || true;

    const options = {
        screen_name: user,
        count: '1',
        include_rts: rts,
        exclude_replies: !mentions
    };

    parent.client.getUserTimeline(options, function (err) {
        console.log('Could not fetch new tweets for' + profile.name + "! " + err);
    }, function (data) {
        let jsonData;

        try {
            jsonData = JSON.parse(data);
        } catch (err) {
            console.log('Could not fetch new tweets for' + profile.name + '! ' + err);
        }


        console.log(data);

        if (jsonData.length >= 1) {

            async.each(jsonData, function (tweet, callback) {
                let urls = '';

                if (tweet.entities.urls.length > 0) {
                    const urlData = tweet.entities.urls.map(function (a) {
                        return a.expanded_url;
                    });

                    urls = '\n:link: Weitere Links aus dem Tweet: <' + urlData.join('>, <') + '>';
                }

                console.log(':bird: Neuer Tweet von **`@' + tweet.user.screen_name + '` (' + tweet.user.name + ')** | <https://twitter.com/' + tweet.user.screen_name + '/status/' + tweet.id_str + '>\n' + urls + '\n```' + tweet.text + '```');
            });
        }
    });
};

if (!(typeof exports === 'undefined')) {
    exports.Twitter = Twitter;
}
