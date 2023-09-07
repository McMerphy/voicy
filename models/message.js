const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MESSAGE_TYPES = {
  text: 'text',
  gif: 'gif',
  sticker: 'sticker',
  video: 'video',
  image: 'image',
  file: 'file',
  voice: 'voice',
  audio: 'audio',
  link: 'link',
  videomessage: 'videomessage',
  chatgpt: 'chatgpt',
  unknown: 'unknown'
}

const messageSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: false,
    },
    messageType: {
      type: String,
      required: true,
      enum: Object.values(MESSAGE_TYPES),
      default: MESSAGE_TYPES.text,
    },
    fromId: {
      type: String,
      required: true
    },
    fwdFrom: {
      type: Object,
      required: false
    },
    isForwarded: {
      type: Boolean,
      require: true,
      default: false
    },
    sticker: {
      type: Object,
      required: false
    },
    date: {
      type: Date,
      required: true
    }
  },
  { timestamps: true, usePushEach: true }
)

module.exports = mongoose.model('message', messageSchema)