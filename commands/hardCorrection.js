// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')
const deleteMessage = require('../middlewares/deleteMessage')

function setupHardCorrection(bot) {
  bot.command('hardcorr', checkAdminLock, async (ctx, next) => {
    if (ctx.from.id != process.env.BOT_OWNER)
      return

    // Reverse admin lock
    ctx.dbchat.correctionWithDelete = !ctx.dbchat.correctionWithDelete
    // Save chat
    ctx.dbchat = await ctx.dbchat.save()
    // Reply with the new setting
    await ctx.replyWithMarkdown(
      ctx.i18n.t(ctx.dbchat.correctionWithDelete ? 'hardcorr_true' : 'hardcorr_false')
    )
    // Log time
    logAnswerTime(ctx, '/hardcorr')

    next()
  }, deleteMessage)
}

// Exports
module.exports = setupHardCorrection
