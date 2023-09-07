// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')

function setupBday(bot) {
  bot.command('bdays', async ctx => {
    await handle(ctx)
  })

}

async function handle(ctx) {
  await ctx.replyWithMarkdown(ctx.i18n.t('bdays'))
  // logAnswerTime(ctx, '/bday')
}

// Exports
module.exports = setupBday
