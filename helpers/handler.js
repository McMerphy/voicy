// Dependencies
const handleMessage = require('./voice')
const { processMessageStat, processSticker } = require('./statistics')
const logAnswerTime = require('../helpers/logAnswerTime')
const { Chat } = require('../models')
const messageTypes = require('./messageTypes')
const checkChatLock = require('../middlewares/chatLock')
const { openaiProcessMessage } = require('./chatgpt')

const log4js = require('log4js')
const logger = log4js.getLogger("cheese");

function setupAudioHandler(bot) {
  // Voice handler
  bot.on(['voice'], checkChatLock, (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_VOICE)
    // Handle voice
    handleMessage(ctx, messageTypes.MESSAGE_VOICE)
    // Log time
    logAnswerTime(ctx, 'voice')
    // Save last voice message sent at
    updateLastVoiceMessageSentAt(ctx)
  })

  // Voice handler
  bot.on(['video_note'], checkChatLock, (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_VIDEOMES)
    // Handle voice
    handleMessage(ctx, messageTypes.MESSAGE_VOICE)
    // Log time
    logAnswerTime(ctx, 'voice')
    // Save last voice message sent at
    updateLastVoiceMessageSentAt(ctx)
  })
  // Audio handler
  bot.on(['audio'], checkChatLock, async (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_AUDIO)
    // Handle voice
    handleDocumentOrAudio(ctx)
    // Log time
    logAnswerTime(ctx, 'voice.document')
    // Save last voice message sent at
    updateLastVoiceMessageSentAt(ctx)
  })

  bot.on(['document'], async (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_FILE)
    // Handle voice
    handleDocumentOrAudio(ctx)
    // Log time
    logAnswerTime(ctx, 'voice.document')
    // Save last voice message sent at
    updateLastVoiceMessageSentAt(ctx)
  })
  bot.on(['video'], async (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_VIDEO)
    // Handle voice
    handleDocumentOrAudio(ctx)
    // Log time
    logAnswerTime(ctx, 'voice.document')
    // Save last voice message sent at
    updateLastVoiceMessageSentAt(ctx)
  })
  // Text handler
  bot.on('text', checkChatLock, async (ctx) => {
    const message = ctx.message || ctx.update.channel_post
    
    if (process.env.FORWARD_FROM_CHAT == message.chat.id)
    {
      await forwardMessage(ctx)
      return
    }

    if (message.text.startsWith('lehabot') || message.text.startsWith('лехабот'))
    {
      await processMessageStat(ctx, messageTypes.MESSAGE_CHATGPT)
      const botReplyText = await openaiProcessMessage(ctx)

      if (botReplyText) await ctx.reply(botReplyText, {
          reply_to_message_id: ctx.message.message_id
      })
    } else {
      await processMessageStat(ctx, messageTypes.MESSAGE_TEXT)
      await handleMessage(ctx, messageTypes.MESSAGE_TEXT)
    }

    // Log time
    logAnswerTime(ctx, 'text')
    // Save last voice message sent at
    // updateLastVoiceMessageSentAt(ctx)
  })

  bot.on('sticker', async (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_STICKER)
    const message = ctx.message || ctx.update.channel_post
    if (process.env.FORWARD_FROM_CHAT == message.chat.id) {
      await forwardSticker(ctx)
      return
    }
    logAnswerTime(ctx, 'sticker')
  })

  bot.on('link', async (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_LINK)

    logAnswerTime(ctx, 'link')
  })

  bot.on('gif', async (ctx) => {
    processMessageStat(ctx, messageTypes.MESSAGE_GIF)

    logAnswerTime(ctx, 'gif')
  })
}



async function forwardMessage(ctx) {   
  const message = ctx.message || ctx.update.channel_post
  message.chat.id = process.env.FORWARD_TO_CHAT

  logger.info(`forwarding message\n ${message.text}`)

  await ctx.telegram.sendMessage(ctx.message.chat.id, message.text)
}


async function forwardSticker(ctx) {   
  const message = ctx.message || ctx.update.channel_post
  message.chat.id = process.env.FORWARD_TO_CHAT
  logger.info(`forwarding sticker`)

  await ctx.telegram.sendSticker(ctx.message.chat.id, message.sticker.file_id)
}


async function updateLastVoiceMessageSentAt(ctx) {
  await Chat.updateOne(
    { id: `${ctx.chat.id}` },
    {
      lastVoiceMessageSentAt: new Date(),
    }
  )
}

async function handleDocumentOrAudio(ctx) {
  if (ctx.dbchat.filesBanned) return
  // Check if correct format
  if (!isCorrectDocument(ctx)) {
    return
  }
  // Handle voice
  handleMessage(ctx, messageTypes.MESSAGE_AUDIO)
}

function isCorrectDocument(ctx) {
  const message = ctx.message || ctx.update.channel_post
  if (!message.document) {
    return true
  }
  const mime = message.document.mime_type
  const allowedMimeTypes = ['audio', 'octet-stream']
  for (const allowedType of allowedMimeTypes) {
    if (mime.indexOf(allowedType) > -1) {
      return true
    }
  }
  return false
}

// Exports
module.exports = setupAudioHandler
