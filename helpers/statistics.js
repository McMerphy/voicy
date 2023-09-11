const { Chat, Message, User } = require('../models')
const messageTypes = require('./messageTypes')
const { findChat } = require('./db')

const log4js = require('log4js')

const logger = log4js.getLogger('cheese')

let usersCache = {}
let chatsCache = {}
let stickersCache = {}

let specialUsers = {
    '257388686': {
        id: 257388686,
        firstName: 'Толя',
        lastName: 'undefined',
        username: 'malanara'
    },
    '508627463': {
        id: 508627463,
        firstName: 'Эдик',
        lastName: 'undefined',
        username: 'alebardo'
    },
    '409451200': {
        id: 409451200,
        firstName: 'Яна',
        lastName: 'undefined',
        username: 'cheyana'
    },
    '763811144': {
        id: 763811144,
        firstName: 'Иисус',
        lastName: 'undefined',
        username: 'belial'
    },
    '789376221': {
        id: 789376221,
        firstName: 'алексей',
        lastName: 'undefined',
        username: 'алексеич'
    }
}

async function processMessageStat(ctx, type = messageTypes.MESSAGE_UNKNOWN) {
    try {
        // Get chat
        console.log('processing stats for chat ', ctx.chat.id)
        const chat = await findChat(ctx.chat.id)

        const message = ctx.message
        // console.log(ctx)
        logger.info(ctx.update.message)
        logger.info(`processMessageStat = ${type}`)

        await processMessage(message, messageTypes.MESSAGE_TEXT)

    } catch (e) {
        logger.error(`${e.message}`)
    }
}

async function processSticker(ctx) {
    try {
        // Get chat
        const chat = await findChat(ctx.chat.id)

        const message = ctx.message
        console.log(message)

        //await processMessage(message)

    } catch (e) {
        logger.error(`${e.message}`)
    }
}

async function processMessage(m, type) {
    logger.info(`precessing message ${m.message_id}`)
    logger.info(`messageType ${type}`)
    let dbMessage = await Message.find().where({ id: m.message_id }).exec()

    if (dbMessage.length > 0) {
        logger.warn(`Message with id ${m.id} already exists`)
        return
    }

    let message = new Message()
    message.id = m.message_id
    message.chatId = m.chat.id
    message.message = m.text
    message.messageType = type

    if (message.messageType == messageTypes.sticker) {
        message.sticker = m.media.document.attributes[1].stickerset
        // let stickers = await this.getStickerSet(message.sticker)
        // console.log(stickers)
    }
    message.fromId = m.from.id
    console.log('fromId', message.fromId)
    let user = await User.find().where({ id: message.fromId.toString() }).exec()

    if (user.length == 0) {
        console.log('user not found, adding new one')
        await addUserToDb(message.fromId)
        console.log('Added user: \n', dbUser)
    }
    message.fwdFrom = m.fwdFrom
    message.date = Date(m.date)
    message.ifForwareded = m.fwdFrom == null

    await message.save()
    console.log(`message ${message.id} was added`)
}

async function addUserToDb(id) {
    let tgUser = await this.getTgUser(id)

    let dbUser = new User({
        id: id,
        firstName: tgUser.firstName,
        lastName: tgUser.lastName,
        username: tgUser.username
    })

    await dbUser.save()

}

async function getTgUser(id) {
    if (!usersCache[id]) {
        if (specialUsers[id]) {
            usersCache[id] = specialUsers[id]
        } else {
            let users = await this.client.invoke(
                new Api.users.GetUsers({
                    id: [new Api.InputUser({
                        userId: id
                    })]
                })
            )
            console.log(id)
            console.log(users)
            process.exit()
            usersCache[id] = users[0]
        }

    }
    console.log(usersCache[id])
    return usersCache[id]
}

module.exports = {
    processMessageStat: processMessageStat,
    processSticker: processSticker
}