// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')

function setupReverse(bot) {
  bot.command('reverse', checkAdminLock, async ctx => {

    // Reverse admin lock
    ctx.dbchat.reverseEnabled = !ctx.dbchat.reverseEnabled
    // Save chat
    ctx.dbchat = await ctx.dbchat.save()
    // Reply with the new setting
    await ctx.replyWithMarkdown(
      ctx.i18n.t(ctx.dbchat.guardEnabled ? 'reverse_true' : 'reverse_false')
    )
    // Log time
    logAnswerTime(ctx, '/reverse')
  })
}

// Exports
module.exports = setupReverse
