var log4js = require('log4js');

function setupLogger() {
    log4js.configure({
        appenders: {
            default: { type: 'console' },
            cheese: { type: 'file', filename: process.env.LOG_PATH || 'voicylog.log' }
        },
        categories: { default: { appenders: ["cheese", "default"], level: "info" } }
    });

    const logger = log4js.getLogger("cheese");

    logger.info('logger started')
}

module.exports = setupLogger
