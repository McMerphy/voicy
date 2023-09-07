const { report } = require('./report')
const { linaWords } = require('./dictionary')
const { findChat } = require('./db')

const log4js = require('log4js');
const { matchesProperty } = require('lodash');
const logger = log4js.getLogger("cheese");

const linaRegexs = []
const lenaRegexs = []

const MAX_MATCHES_IN_MESSAGE = 32

    ; (function init() {
        try {
            logger.info(`Guard initializtion for worker ${process.pid}`)
            if (process.env.LINA_REGEX) {
                logger.info(`Including LINA_REGEX to a checklist: ${process.env.LINA_REGEX}`)
                linaRegexs.push(new RegExp(process.env.LINA_REGEX, 'g'))
            }
            if (process.env.LENA_REGEX) {
                logger.info(`Including LENA_REGEX to a checklist: ${process.env.LENA_REGEX}`)
                lenaRegexs.push(new RegExp(process.env.LENA_REGEX, 'g'))
            }
        } catch (err) {
            logger.error('SpellGuard initialization failed')
            logger.error(err)
        }
    })()


const excludes = JSON.parse(process.env.LINA_REGEX_EXCLUDES || "[]")
const immuneUsers = JSON.parse(process.env.IMMUNE_USERS || "[]")

/**
 * Checks messages for words in a dictionary and sends reply if finds it
 * @param {Telegraf:Context} ctx Context of the request
 */
async function checkSpelling(ctx, text) {
    try {
        let chatImmuneUsers = immuneUsers
            .filter(obj => { return obj.chat_id == ctx.chat.id })
            .reduce((arr, item) => { arr.push(...(item.users)); return arr }, [])

        if (chatImmuneUsers.includes(ctx.from.id)) {
            logger.info(`user ${ctx.from.id} is immune, message will not be validated`)
            return
        }
            
        const chat = await findChat(ctx.chat.id)
        let dictionary = []
        chat.dictionary.map(elem => dictionary.push(elem))

        let regexDictionary = []
        chat.regexDictionary.map(elem => regexDictionary.push(new RegExp(elem, 'g')))

        let reply = ""
        let message_id = 0

        if (chat.smartGuard) {
            let regexes = linaRegexs
            if (chat.reverseEnabled) {
                regexes = lenaRegexs
            }

            let { words, editedStr } = fixLenaMatches(text, regexes, excludes, chat.reverseEnabled)
            if (words.length != 0)
                message_id = await sendMessage(ctx, chat, editedStr)

        } else {
            let { words, editedStr } = contains(text, linaWords, false, true)
            if (words.length != 0) {
                message_id = await sendMessage(ctx, chat, editedStr)
            }
        }

        let { words } = contains(text, dictionary)
        if (words.length != 0) {
            if (reply.length != 0)
                reply += ', '
            reply += words.join(', ')
        }

        let words1 = contains(text, regexDictionary, true).words
        if (words1.length != 0) {
            if (reply.length != 0)
                reply += ', '
            reply += words1.join(', ')
        }

        if (reply.length > 0) {
            logger.info("Reply:", reply)
            sendReply(ctx, reply, message_id)
        }


    } catch (err) {
        report(ctx, err, 'handleMessage')
    }
}

/**
 * Sends reply to a message with violating content
 * @param {Telegraf:Context} ctx Context of the request
 */
async function sendReply(ctx, word, message_id) {

    const message = ctx.message || ctx.update.channel_post
    const options = {
        reply_to_message_id: message_id || message.message_id
    }
    options.parse_mode = 'Markdown'
    options.disable_web_page_preview = true

    let i = getRandomInt(4)
    let langKey = 'judgemental_' + i


    await ctx.replyWithMarkdown(ctx.i18n.t(langKey, { word: word }), options)
}

/**
 * Sends reply to a message with violating content
 * @param {Telegraf:Context} ctx Context of the request
 */
async function sendMessage(ctx, chat, message) {
    message = message.replace(/\_/g, "\\_")
    message = message.replace(/\*/g, "\\*")
    message = message.replace(/\#/g, "\\#")
    if (chat.correctionWithDelete)
        message = `*${ctx.message.from.first_name} @${ctx.message.from.username}*, сказал(а):\n${message}\n`
    const options = {}
    options.parse_mode = 'Markdown'
    options.disable_web_page_preview = true
    res = await ctx.telegram.sendMessage(ctx.message.chat.id, message, options)
    try {
        if (chat.correctionWithDelete) {
            await deleteMessage(ctx, ctx.message)
            return res.message_id
        } else {
            return 0
        }

    } catch (err) {
        report(ctx, err, 'handleMessage')
        return 0
    }
}

/**
 * Deletes message with violating content
 * @param {Telegraf:Context} ctx Context of the request
 */
async function deleteMessage(ctx, message) {
    await ctx.telegram.deleteMessage(ctx.message.chat.id, message.message_id)
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function fixLenaMatches(str, regexes, excludes, reverseEnabled = false) {
    let lowStr = str.toLowerCase()
    let editedStr = str
    let words = []

    logger.info(`find lena matches`)

    for (let regex of regexes) {
        // In case if there are too many matches in one message we should brake
        // the loop (vs spam or bad written regex)
        let guardCounter = 0
        while (match = regex.exec(lowStr)) {
            let matchEndIndex = match.index + match[0].length
            let isExluded = false
            for (let exclude of excludes) {
                let substr = str.substring(matchEndIndex - exclude.length, matchEndIndex)
                if (exclude == substr) {
                    isExluded = true
                    break
                }
            }
            if (isExluded)
                continue

            let strToReplace = str.substring(match.index, match.index + match[0].length)
            let replacementStr = ''
            if (reverseEnabled)
                replacementStr = strToReplace.replace(/(?<!^)[i|и|і](?!$)/g, 'е')
                    .replace(/(?<!^)[И|I|І](?!$)/g, 'Е')
            else
                replacementStr = strToReplace.replace(/^[е|Е|e|E|а|А|о|О|o|O|a|A]+/g, '')
                    .replace(/(?<!^)[е|ё](?!$)/g, 'и')
                    .replace(/(?<!^)[e](?!$)/g, 'i')
                    .replace(/(?<!^)[Е|Ё](?!$)/g, 'И')
                    .replace(/(?<!^)[E](?!$)/g, 'I')
            logger.info(`replacing ${strToReplace} with ${replacementStr}`)
            editedStr = editedStr.replace(strToReplace, replacementStr)
            words.push(match[0])
            if (guardCounter++ > MAX_MATCHES_IN_MESSAGE) {
                logger.info(`reached max number in one message: ${MAX_MATCHES_IN_MESSAGE}`)
                break
            }

        }
    }


    return { words: words, editedStr: editedStr }
}

function contains(str, dictionary, isRegex = false, isEdit = false, split = false) {
    let bits = str.toLowerCase().split(/[\s,.-\\?\\!]+/)
    let bitsRegularCase = str.split(/[\s,.-\\?\\!]+/)

    let foundWords = []
    let editedStr = str


    if (isRegex) {
        for (let regex of dictionary) {
            for (i = 0; i < bits.length; i++) {
                if (regex.test(bits[i])) {
                    if (isEdit) {
                        let fixedWord = bitsRegularCase[i].replace(/^[е|Е|e|E|а|А|о|О|o|O|a|A]+/g, '')
                            .replace(/(?<!^)[е|e|ё](?!$)/g, 'и')
                            .replace(/(?<!^)[Е|E|Ё](?!$)/g, 'И')
                        fixedWord = fixedWord.charAt(0).toUpperCase() + fixedWord.slice(1)
                        let regex = new RegExp(bitsRegularCase[i], "g")
                        logger.info(editedStr, ' replace ' + bitsRegularCase[i] + ' with ' + fixedWord)
                        editedStr = editedStr.replace(regex, "\\*" + fixedWord)
                    }
                    console.log("found", str)
                    foundWords.push(str.split(/[\s,.-]+/)[i])
                }

            }
        }

    } else {
        for (let word of dictionary) {
            for (i = 0; i < bits.length; i++) {
                if (bits[i] == word) {
                    if (isEdit) {
                        let fixedWord = bitsRegularCase[i].replace(/^[е|Е|e|E|а|А|о|О|o|O|a|A]+/g, '')
                            .replace(/(?<!^)[е|e|ё](?!$)/g, 'и')
                            .replace(/(?<!^)[Е|E|Ё](?!$)/g, 'И')
                        let regex = new RegExp(bitsRegularCase[i], "g")
                        editedStr.replace(regex, "\\*" + fixedWord)
                    }
                    foundWords.push(str.split(/[\s,.-]+/)[i])
                }

            }
        }
    }
    return { words: foundWords, editedStr: editedStr };
}

// Exports
module.exports = checkSpelling