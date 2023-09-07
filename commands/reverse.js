// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')
const log4js = require('log4js');
const logger = log4js.getLogger("cheese");

function setupReverse(bot) {
  bot.command('reverse', checkAdminLock, async ctx => {

    // Reverse admin lock
    ctx.dbchat.reverseEnabled = !ctx.dbchat.reverseEnabled
    logger.info(`reverse new value: ${ctx.dbchat.reverseEnabled}`)
    // Save chat
    ctx.dbchat = await ctx.dbchat.save()
    // Reply with the new setting
    await ctx.replyWithMarkdown(
      ctx.i18n.t(ctx.dbchat.reverseEnabled ? 'reverse_true' : 'reverse_false')
    )
    // Log time
    logAnswerTime(ctx, '/reverse')
  })
}

// Exports
module.exports = setupReverse
