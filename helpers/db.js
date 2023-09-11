// Dependencies
const { Voice, Chat, User } = require('../models')

/**
 * Searches for chat by it's id, creates new chat if doesn't exist yet
 * @param {Telegram:ChatId} id Id of the chat to search
 * @returns Chat with the specified id
 */
async function findChat(id) {
  let chat = await Chat.findOne({ id })
  if (!chat) {
    chat = new Chat({ id })
    chat = await chat.save()
  }
  return chat
}

/**
 * Adds a voice to the database
 * @param {URL} url Url of the audio file
 * @param {String} text Transcription in text
 * @param {Mongoose:Chat} chat Chat where audio was recognized
 * @param {Int} duration Duration of this voice message
 */
async function addVoice(url, text, chat, duration, textWithTimecodes, fileId) {
  // Get language
  const language =
    chat.engine === 'wit'
      ? chat.witLanguage
      : chat.engine === 'ashmanov'
      ? 'ashmanov'
      : chat.googleLanguage
  // Create and save voice
  const voice = new Voice({
    url,
    text,
    language,
    duration,
    engine: chat.engine,
    textWithTimecodes,
    fileId,
  })
  const dbvoice = await voice.save()
  // Return the voice
  return dbvoice
}

/**
 * Searches for voice in database
 * @param {URL} url Url of the audio file
 * @param {String} language Language of the audio file
 * @param {String} engine Engine of the audio file
 * @returns {Mongoose:Voice} Voice or null
 */
function findVoice(url, language, engine) {
  return Voice.findOne({ url, language, engine })
}

/**
 * Searches for chat by it's id, creates new chat if doesn't exist yet
 * @param {Telegram:ChatId} id Id of the chat to search
 * @returns Chat with the specified id
 */
async function GetChatUsers(id) {
  let chat = await Chat.findOne({ id })
  if (!chat) {
    chat = new Chat({ id })
    chat = await chat.save()
  }
  let users = await User.find({id: {$in: chat.users}})
  
  return users
}

/**
 * Searches for chat by it's id, creates new chat if doesn't exist yet
 * @param {Telegram:ChatId} id Id of the chat to search
 * @returns Chat with the specified id
 */
async function FindUser(id) {
  let user = await User.findOne({ id })
  
  return user
}

/**
 * Searches for chat by it's id, creates new chat if doesn't exist yet
 * @param {Telegram:ChatId} id Id of the chat to search
 * @returns Chat with the specified id
 */
async function AddUser(userInfo) {
  let user = await User.findOne({ id })

  if (!user) {
    user = new User({ id:  userInfo.id, firstName: userInfo.firstName, lastName: userInfo.lastName, username: userInfo.username})
    user = await user.save()
  }
  
  return user
}

// Exports
module.exports = {
  findChat,
  addVoice,
  findVoice,
  GetChatUsers,
  FindUser,
  AddUser
}
