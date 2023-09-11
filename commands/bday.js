// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')

function setupBday(bot) {
  bot.command('bdays', async ctx => {
    await handle(ctx)
  })

  // bot.command('addbday', async ctx => {
  //   const message = ctx.message || ctx.update.channel_post
  //   let words = message.text.split(' ')
  //   let username = words[0]
  // })
}

async function handle(ctx) {
  await ctx.replyWithMarkdown(ctx.i18n.t('bdays'))
  // logAnswerTime(ctx, '/bday')
}

// Exports
module.exports = setupBday
