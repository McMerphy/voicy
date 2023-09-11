const { Chat, Message } = require('../models')
const { findChat } = require('./db')

const log4js = require('log4js')
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const logger = log4js.getLogger('cheese')

// statistics of requests from users
//  
// {
//     userid: "id",
//     messages : [{ts: 123123}]
// }
const RequestStats = {}

function hasReachedRequestLimit(userId, timeFrame, limit)
{
    let user = RequestStats[userId]
    console.log('user :', user)

    const timeNow = new Date().getTime()

    user.messagesTs = user.messagesTs.filter(ts => timeNow - ts < timeFrame)

    if (user.messagesTs.length > limit) {
        return true
    } else {
        user.messagesTs.push(timeNow)
        return false
    }
}

async function openaiProcessMessage(ctx) {
    const message = ctx.message
    let userid = message.from.id
    try {
        // Get chat
        logger.info('process message with OpenAI')
        console.log(`message from ${userid}`)


        // 10 minutes, 15 messages
        if (!RequestStats[userid]) RequestStats[userid] = { messagesTs: [], isAnswering: false}
        
        

        let systemMessage = ''
        let wasAsked = true
        let maxTokens = 250


        if (message.text.startsWith('lehabot')) {
            systemMessage = 'Answer like you speak to a 5 year old. Answer in English'
        }
        else if (message.text.startsWith('лехабот')) {
            if (userid == '607520416') {
                systemMessage = 'Адказвай на беларускай мове'
            }
            else {
                systemMessage = 'Отвечай кратко на русском'
            }
            maxTokens = 600
        }
        else {
            wasAsked = false
        }

        if (wasAsked) {
            if (RequestStats[userid].isAnswering)
            {
                return 'Я еще не ответил на предыдущий вопрос'
            }
            if (hasReachedRequestLimit(userid, process.env.OPENAI_TIME_LIMIT_MINS * 60 * 1000, process.env.OPENAI_MESSAGES_LIMIT)) {
                return 'Слишком много вопросов, дай отдохнуть'
            }

            RequestStats[userid].isAnswering = true
            const completion = await openai.createChatCompletion({
                max_tokens: maxTokens,
                model: "gpt-3.5-turbo",
                user: message.from.id + '',
                messages: [{ role: 'system', content: systemMessage }, { role: "user", content: message.text.substring(7) }]
            })

            logger.info(`result len: ${completion.data.choices[0].message.content.length}`)
            RequestStats[userid].isAnswering = false
            return completion.data.choices[0].message.content
        }
        else {
            return ''
        }
        

    } catch (e) {
        logger.error(`${e.message}`)
        RequestStats[userid].isAnswering = false
        return ''
    }
}


module.exports = {
    openaiProcessMessage: openaiProcessMessage,
}

