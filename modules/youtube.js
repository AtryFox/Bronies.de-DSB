const YouTubeNode = require('youtube-node');

function YouTube(bot) {
    this.bot = bot;

    this.initYouTube();
}

YouTube.prototype.initYouTube = function () {
    this.yt = new YouTubeNode();
    this.yt.setKey(this.bot.config.YOUTUBE_KEY);
    this.yt.addParam('type', 'video');
};

YouTube.prototype.searchVideo = function (query, callback) {
    this.yt.search(query, 1, (error, result) => {
        if (error) {
            this.bot.log(JSON.stringify(error));
            return callback(false);
        } else {
            if (result.items.length == 1) {
                return callback(result.items[0]);
            }
        }

        callback(false);
    });
};

if (!(typeof exports === 'undefined')) {
    exports.YouTube = YouTube;
}
