const axios = require('axios');
const {
  isSubmitMap,
  isSurfType,
  getMapMatch,
  getSubmitMapName,
  getSurfType
} = require('../util/switches');
const getErr = require('../util/get-error');

module.exports = handleSubmitCMD;

async function handleSubmitCMD (m) {
  const shouldRespond = m.channel.id === process.env.submitCHANNELID;
  if(!shouldRespond) return;
  // turn stringMsg to object
  const values = getValuesFromMessage(m);
  const errorText = getErrorText(values, m);
  if(errorText) {
    await m.react('❌');
    m.channel.send('❌'+getErr()+'```'+errorText+'````!help` to see example format');
    return;
  }
  await m.react('💬');
  const botMsg = await m.channel.send('Please hold 💬');
  try {
    // actually submit the thing
    const urlVals = urlEncode(values);
    const resp = await axios.post(process.env.gFORM, urlVals);
    if(m.reactions.get('💬')) { // had an error where reaction couldnt be removed
      await m.reactions.get('💬').remove();
    }
    if(resp.status === 200) {
      m.react('✅');
      botMsg.edit(`✅ Record submitted by ${m.author.username}`);
    } else {
      m.react('❌');
      botMsg.edit('❌ Submit failed, I\'m pinging joe RIGHT now.');
      await axios.post(process.env.joeHOOK, JSON.stringify({
        content: `Bot submit fail
        ${resp.status} : ${resp.statusText}`
      }));
    }
    return;
  } catch (e) {
    if(m.reactions.get('💬')) {
      await m.reactions.get('💬').remove();
    }
    console.error(`error at handleSubmitCMD:\n${e.message}\n\n${e.stack}`);
    m.react('❌');
    botMsg.edit('❌ Apologies, something broke. I\'m pinging joe RIGHT now.');
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}> Error @ handleSubmitCMD:
      ${e.message}
      ${e.stack}`
    }));
  }
}

function getValuesFromMessage(m) {
  const rawStr = m.content.replace('!submit ', '');
  const valArr = rawStr.split(',').map(i => i.trim());
  // add user who issued !submit command
  const values = {
    name: `${m.author.username}#${m.author.discriminator}`
  };
  for(const val of valArr) {
    if (val.includes('://')) values.link = val;
    else if (isSubmitMap(val)) values.map = getSubmitMapName(val);
    else if (isSurfType(val)) values.mode = getSurfType(val);
    else if (parseFloat(val)) values.time = getTime(val);
  }

  return values;
}

function getErrorText (v, m) {
  let error = null;
  // ** prompt: value not recongnised error **
  const e = ['mode', 'map', 'time', 'link']
  .filter(k => !Object.keys(v).includes(k));
  if(e.length) {
    error = `Missing ${e.join(', ')}`;
  }
  // ** prompt: map spelling error **
  // only prompt map if user has submitted 4 values
  // eg: assume one of the values submitted was a map
  const msgContentArr = m.content.replace('!submit ', '').split(',').map(i => i.trim());
  if(msgContentArr.length > 3 && e.includes('map')) {
    const mapSuggestion = getMapMatch(msgContentArr);
    if(mapSuggestion) error += `\nDid you mean ${mapSuggestion}?`
  }
  // ** prompt: time decimal place error **
  // only check time dp if we recognized a time value
  if(v.time) {
    const not2DP = !v.time.split('.')[1]
    || v.time.split('.')[1].length !== 2;
    if(not2DP) {
      error += '\nTime must be to 2 decimal places';
    }
  }
  return error;
}

function urlEncode (v) {
  const { timeINPUT, linkINPUT, modeINPUT, nameINPUT, mapINPUT } = process.env;
  let u = '';
  u+=`${timeINPUT}=${v.time}`;
  u+=`&${modeINPUT}=${v.mode}`;
  u+=`&${nameINPUT}=${v.name}`;
  u+=`&${mapINPUT}=${v.map}`;
  u+=`&${linkINPUT}=${v.link}`;
  return u;
}

function getTime (str) {
  const a = str.split('.')
  // slice to 2dp if there is a decimal point
  // if no decimal, error will get caught at getErrorText
  if(!a[1]) return str;
  return `${a[0]}.${a[1].slice(0, 2)}`;
}
