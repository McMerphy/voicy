// Dependencies
const logAnswerTime = require('../helpers/logAnswerTime')
const checkAdminLock = require('../middlewares/adminLock')

function setupDictionary(bot) {
  bot.command('dictionary', async ctx => {
    let dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary.map((word) => '\`' + word + '\`'))

    await ctx.replyWithMarkdown(
      ctx.i18n.t('dictionary_true', { dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') })
    )
  })

  bot.command('cleandict', checkAdminLock, async ctx => {

    ctx.dbchat.dictionary = []
    ctx.dbchat.regexDictionary = []
    ctx.dbchat = await ctx.dbchat.save()

    await ctx.replyWithMarkdown(
      ctx.i18n.t('dictionary_cleaned')
    )


    logAnswerTime(ctx, '/cleandict')
  })

  bot.command('rmwords', checkAdminLock, async ctx => {
    function removeItemAll(arr, value) {
      var i = 0;
      while (i < arr.length) {
        if (arr[i] === value) {
          arr.splice(i, 1);
        } else {
          ++i;
        }
      }
      return arr;
    }

    const message = ctx.message || ctx.update.channel_post
    let words = message.text.split(' ')
    words.shift()
    if (words.length > 0) {
      let dictionary = []
      let deletedWords = []
      ctx.dbchat.dictionary.map(elem => dictionary.push(elem))

      for (let word of words) {
        let length = dictionary.length
        dictionary = removeItemAll(dictionary, word)
        if (length > dictionary.length)
          deletedWords.push(word)
      }
      ctx.dbchat.dictionary = dictionary
      ctx.dbchat = await ctx.dbchat.save()

      dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)

      if (deletedWords.length > 0)
        await ctx.replyWithMarkdown(
          ctx.i18n.t('rmword_true', { words: deletedWords.join(', '), dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
      else
        await ctx.replyWithMarkdown(
          ctx.i18n.t('rmword_false', { dictionary: dictionary.join(' ') }))
    }
    else {
      let dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)
      await ctx.replyWithMarkdown(
        ctx.i18n.t('rmword_false', { dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
    }



    logAnswerTime(ctx, '/rmwords')
  })


  bot.command('addwords', async ctx => {
    const message = ctx.message || ctx.update.channel_post
    let words = message.text.split(' ')
    words.shift()
    if (words.length > 0) {
      let dictionary = []
      let addedWords = []
      ctx.dbchat.dictionary.map(elem => dictionary.push(elem))

      for (let word of words) {
        if (!dictionary.includes(word)) {
          ctx.dbchat.dictionary.push(word)
          addedWords.push(word)
        }
      }

      ctx.dbchat = await ctx.dbchat.save()
      dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)

      if (wasAdded)
        await ctx.replyWithMarkdown(
          ctx.i18n.t('addword_true', { words: regex, dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
      else
        await ctx.replyWithMarkdown(
          ctx.i18n.t('addword_false', { dictionary: allWords.join(' ') }))
    } else {
      let dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)
      await ctx.replyWithMarkdown(
        ctx.i18n.t('addword_false', { dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
    }

    logAnswerTime(ctx, '/addwords')
  })


  bot.command('addregex', checkAdminLock, async ctx => {
    const message = ctx.message || ctx.update.channel_post
    let regexes = message.text.split(' ')
    regexes.shift()
    let regex = regexes.shift()
    if (regex != "") {
      let dictionary = []
      let wasAdded = false
      ctx.dbchat.regexDictionary.map(elem => dictionary.push(elem))

      if (!dictionary.includes(regex)) {
        ctx.dbchat.regexDictionary.push(regex)
        wasAdded = true
      }

      ctx.dbchat = await ctx.dbchat.save()
      dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)

      if (wasAdded)
        await ctx.replyWithMarkdown(
          ctx.i18n.t('addword_true', { words: regex, dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
      else
        await ctx.replyWithMarkdown(
          ctx.i18n.t('addword_false', { dictionary: allWords.join(' ') }))
    } else {
      let dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)
      await ctx.replyWithMarkdown(
        ctx.i18n.t('addword_false', { dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
    }


    logAnswerTime(ctx, '/addwords')
  })


  bot.command('rmbyid', checkAdminLock, async ctx => {
    let id = parseInt(ctx.message.text.split(' ')[1])

    let dictionary = []
    let regexDictionary = []
    let deletedWords = []
    ctx.dbchat.dictionary.map(elem => dictionary.push(elem))
    ctx.dbchat.regexDictionary.map(elem => regexDictionary.push(elem))

    let length = dictionary.length + regexDictionary.length

    console.log('length: ', length)

    if (id != NaN && id >= 0 && id < length) {
      if (id < dictionary.length) {
        console.log('deleting word ', dictionary[id])
        deletedWords.push(dictionary[id])
        dictionary.splice(id, 1)
        ctx.dbchat.dictionary = dictionary
      }
      else {
        let regexId = id - dictionary.length 
        console.log('deleting word ', regexDictionary[regexId])
        deletedWords.push(regexDictionary[regexId])
        regexDictionary.splice(regexId, 1)
        ctx.dbchat.regexDictionary = regexDictionary
        
      }
      
    }
    ctx.dbchat = await ctx.dbchat.save()

    dictionary = ctx.dbchat.dictionary.concat(ctx.dbchat.regexDictionary)

    if (deletedWords.length > 0)
      await ctx.replyWithMarkdown(
        ctx.i18n.t('rmword_true', { words: deletedWords.join(', '), dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))
    else
      await ctx.replyWithMarkdown(
        ctx.i18n.t('rmword_false', { dictionary: dictionary.map((word, i) => i + '. ' + word).join('  ') }))


    logAnswerTime(ctx, '/rmbyid')
  })
}



// Exports
module.exports = setupDictionary