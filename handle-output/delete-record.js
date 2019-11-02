const axios = require('axios');

const getRecordsSheet = require('../util/records-sheet');
const { getGoogleAuth } = require('../util/google-auth');
const {
  getEmojiFromNum,
  getNumFromEmoji
} = require('../util/switches');
const recordFilter = require('../util/record-log-filter');

module.exports = handleDeleteCMD;

// only one delete process at at time. Threadsafe btw :)
let isDeleting = false;

async function handleDeleteCMD (m) {
  // only I may delete: m.author.id === process.env.joeUSERID;
  const shouldRespond = !isDeleting;
  if(!shouldRespond) return;

  isDeleting = true;

  await m.react('💬');
  const botMsg = await m.channel.send('💬 Finding records, please hold');
  try {

    const opts = await getDeleteOptions(m);
    if(!opts.length) {
      await m.react('❌');
      botMsg.edit('❌ No matching records found for user '+m.author.username);
      isDeleting = false;
      return;
    }

    const userChoice = await getUserReaction(
      m,
      botMsg,
      opts
    );
    if(!userChoice || !userChoice.first()) {
      await m.react('⏱')
      botMsg.edit('⏱ Timeout, no record deleted');
      isDeleting = false;
      return;
    }

    await deleteSpreadsheetRow(
      m,
      botMsg,
      opts,
      userChoice
    );

    isDeleting = false;

    return;
  } catch (e) {
    isDeleting = false;
    if(m.reactions.get('💬')) {
      await m.reactions.get('💬').remove();
    }
    console.error(`error at handleDeleteCMD:\n${e.message}\n\n${e.stack}`);
    m.react('❌');
    botMsg.edit('❌ Apologies, something broke. I\'m pinging joe RIGHT now.');
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}> Error @ handleDeleteCMD:
      ${e.message}
      ${e.stack}`
    }));
  }
}

async function getDeleteOptions (m) {
  const allRecords = await getRecordsSheet();
  if(m.reactions.get('💬')) {
    await m.reactions.get('💬').remove();
  }
  // find a record that matches the msgContent
  const opts = allRecords
  .filter(recordFilter(m))
  .slice(-5); // 5 suggestions max

  return opts;
}

async function getUserReaction (m, botMsg, opts) {
  const reactOpts = []
  for(let i = 0; i < opts.length; i++) {
    const emoji = getEmojiFromNum(i+1);
    reactOpts.push(emoji);
    await botMsg.react(emoji);
  }

  await m.react('❔');
  const strOpts = opts.map((o, i) => '```'+reactOpts[i]+' '+o.data+'```').join('');
  botMsg.edit('Use reactions to choose record to delete:'+strOpts);

  const userChoice = await botMsg.awaitReactions(
    reactFilter(reactOpts, m.author.id),
    { max: 1, time: 12000 }
  );

  if(m.reactions.get('❔')) {
    await m.reactions.get('❔').remove();
  }

  for(let i = 0; i < reactOpts.length; i++) {
    const emoji = reactOpts[i];
    if(botMsg.reactions.get(emoji)) {
      await botMsg.reactions.get(emoji).remove();
    }
  }

  return userChoice;
}

async function deleteSpreadsheetRow (m, botMsg, opts, userChoice) {
  const c = userChoice.first();
  const delChoiceIdx = getNumFromEmoji(c.emoji.name);
  const delURL = opts[delChoiceIdx - 1].url;
  const delREC = opts[delChoiceIdx - 1].data;

  await m.react('💬');
  botMsg.edit('💬 Deleting, please hold```'+c.emoji.name+' '+delREC+'```');
  const gAuth = await getGoogleAuth();
  const deleteRes = await axios.delete(delURL, {
    headers: { Authorization: gAuth }
  });
  if(m.reactions.get('💬')) {
    await m.reactions.get('💬').remove();
  }
  await m.react('✅');
  botMsg.edit('✅ Record deleted by '+m.author.username+'```'+c.emoji.name+' '+delREC+'```');

  return;
}

function reactFilter (opts, id) {
  return (reaction, user) => {
    return user.id === id && opts.includes(reaction.emoji.name);
  }
}
