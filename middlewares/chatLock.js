const log4js = require('log4js')
const logger = log4js.getLogger("cheese");

module.exports = async function checkChatLock(ctx, next) {
    const message = ctx.message || ctx.update.channel_post

    logger.info(`Got message from chat ${message.chat.id}`)

    if (process.env.ALLOWED_CHATS.includes(message.chat.id))
      next()    
  }