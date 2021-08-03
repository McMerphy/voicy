const log4js = require('log4js')
const logger = log4js.getLogger("cheese");

module.exports = async function checkChatLock(ctx, next) {
    logger.info(`Deleting message: ${ctx.message.text}`)

    await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
  }