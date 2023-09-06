const log4js = require('log4js')
const logger = log4js.getLogger("cheese");

module.exports = function logAnswerTime(ctx, name) {
  logger.info(
    `${name} answered in ${(new Date().getTime() - ctx.timeReceived.getTime()) /
      1000}s, CHAT: ${ctx.message.chat.id} - ${ctx.message.chat.title} ... FROM: ${ctx.message.from.id} - ${ctx.message.from.username}`
  )
  if (ctx.message.text)
    logger.info(ctx.message.text)
}
