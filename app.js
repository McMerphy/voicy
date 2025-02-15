// Load env variables
require('dotenv').config({ path: `${__dirname}/.env` })

// Init
const setupLogger = require('./init/setupLogger')
// Init
setupLogger()
const setupPromises = require('./init/setupPromises')
const setupMongoose = require('./init/setupMongoose')
const { bot, startBot } = require('./init/bot')
// Middlewares
const setupCheckDate = require('./middlewares/checkDate')
const setupTimeReceived = require('./middlewares/timeReceived')
const setupCounter = require('./middlewares/counter')
const setupAttachChat = require('./middlewares/attachChat')
const setupI18N = require('./middlewares/i18n')
// Commands
const setupHelp = require('./commands/help')
const setupBday = require('./commands/bday')
const { setupStart } = require('./commands/start')
const setupLanguage = require('./commands/language')
const setupEngine = require('./commands/engine')
const setupLock = require('./commands/lock')
const setupFiles = require('./commands/files')
const setupSilent = require('./commands/silent')
const { setupGoogle, setupCheckingCredentials } = require('./commands/google')
const setupGeeky = require('./commands/geeky')
const setupTimecodes = require('./commands/timecodes')
const setupRecognition = require('./commands/recognition')
const setupVoiceGuard = require('./commands/voiceGuard')
const setupSmartGuard = require('./commands/smartGuard')
const setupGuard = require('./commands/guard')
const setupReverse = require('./commands/reverse')
const setupDictionary = require('./commands/dictionary')
const setupUrl = require('./commands/url')
const setupAdmin = require('./commands/admin')
const setupPrivacy = require('./commands/privacy')
const setupWitToken = require('./commands/witToken')
const setupHardCorrection = require('./commands/hardCorrection')
// Audio handler
const setupAudioHandler = require('./helpers/handler')
// Callbacks
const setupCallbackHandler = require('./helpers/callback')


setupPromises()
setupMongoose()
// Middlewares
setupTimeReceived(bot)
setupCheckDate(bot)
setupCounter(bot)
setupAttachChat(bot)
setupI18N(bot)
// setupCheckingCredentials(bot)
// Commands
setupHelp(bot)
setupBday(bot)
setupStart(bot)
setupLanguage(bot)
// setupEngine(bot)
setupLock(bot)
// setupFiles(bot)
setupSilent(bot)
setupRecognition(bot)
setupVoiceGuard(bot)
setupSmartGuard(bot)
setupGuard(bot)
setupReverse(bot)
setupHardCorrection(bot)
setupDictionary(bot)
// setupGoogle(bot)
// setupGeeky(bot)
// setupTimecodes(bot)
// setupUrl(bot)
setupAdmin(bot)
// setupPrivacy(bot)
// setupWitToken(bot)
bot.command('validation', (ctx) => ctx.reply('success'))
// Audio handler
setupAudioHandler(bot)
// Callbacks
setupCallbackHandler(bot)

// Let's rock!
startBot()
