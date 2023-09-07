const mongoose = require('mongoose')
const engines = require('../engines')

const Schema = mongoose.Schema

const languages = engines.reduce((p, c) => {
  p[`${c.code}Language`] = {
    type: String,
    required: true,
    default: c.defaultLanguageCode,
  }
  return p
}, {})

const chatSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    engine: {
      type: String,
      required: true,
      enum: engines.map((e) => e.code),
      default: 'wit',
    },
    ...languages,
    adminLocked: {
      type: Boolean,
      required: true,
      default: false,
    },
    silent: {
      type: Boolean,
      required: true,
      default: false,
    },
    filesBanned: {
      type: Boolean,
      required: true,
      default: true,
    },
    guardEnabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    reverseEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    smartGuard: {
      type: Boolean,
      required: true,
      default: true,
    },
    checkVoiceSpelling: {
      type: Boolean,
      required: true,
      default: true,
    },
    voiceToText: {
      type: Boolean,
      required: true,
      default: false,
    },
    showPromo: {
      type: Boolean,
      required: true,
      default: false,
    },
    correctionWithDelete: {
      type: Boolean,
      required: true,
      default: true,
    },
    dictionary: [String],
    regexDictionary: [String],
    googleSetupMessageId: Number,
    googleKey: String,
    witToken: String,
    timecodesEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastVoiceMessageSentAt: {
      type: Date,
      required: false,
    },
    // Added just as a virtual variable
    language: String,
    users: {
      type: Array,
      required: true,
      default: []
    },
  },
  { timestamps: true, usePushEach: true}
)

module.exports = mongoose.model('chat', chatSchema)
