// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')

function setupBday(bot) {
  bot.help(ctx => {
    handle(ctx)
  })
}

async function handle(ctx) {
  await ctx.replyWithMarkdown(ctx.i18n.t('bday'), {
    disable_web_page_preview: true,
  })
  logAnswerTime(ctx, '/bday')
}

// Exports
module.exports = setupBday
