// Main config of the bot

module.exports = {
    // Token of the Discord application
    TOKEN: '',

    // Server ID
    SERVER_ID: '',

    // Channel ID of channel for e.g. join and leave messages
    DEFAULT_CH: '',

    // Channel ID of channel for debug/info messages
    BOT_CH: '',

    // Channel ID of channel for admin logs
    LOG_CH: '',

    // Channel ID of channel with server info and rules (used in welcome message)
    INFO_CH: '',

    // Client ID of admin user
    BOT_ADMIN: '',

    // Path to radio restart script (see https://github.com/DerAtrox/DiscordRadio)
    RADIO_START: '',

    // Client ID of radio bot
    RADIO_BOT: '',

    // YouTube API key
    YOUTUBE_KEY: '',

    // Base URL for e.g. spoiler command and images used in commands (without appended slash)
    BASE_URL: '',

    // Twitter API key
    TWITTER_API: {
        CONSUMER_KEY: '',
        CONSUMER_SECRET: '',
        ACCESS_TOKEN_KEY: '',
        ACCESS_TOKEN_SECRET: ''
    },

    // MySQL server credentials
    MYSQL_SERVER: {
        HOSTNAME: '',
        PORT: '',
        USERNAME: '',
        PASSWORD: '',
        DATABASE: ''
    },

    // Enable more debug messages sent to BOT_CH
    DEBUG: false
};