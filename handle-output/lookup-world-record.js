const axios = require('axios');

const { getMapMatch, getSurfTypeMatch } = require('../util/switches');
const { getCache } = require('../util/cache');

module.exports = handleWorldRecordCMD;

const helpText = '**how 2 lookup world-records**\n\nGet grav and standard records for a map:```!wr hanamura grav```\*Please include "standard" or "grav" to make sure you get the right record!*\n\nHappy surfing 🏄‍'

async function handleWorldRecordCMD (m) {
  try {
    const contentRaw = m.content.replace('!wr', '').replace(/ /gi, '');
    if(!contentRaw) return;

    const vals = contentRaw.split(',').map(i => i.trim().toLowerCase());
    if(vals.includes('help')) {
      await m.channel.send(helpText);
      return;
    }
    // get best map match from message content
    const map = getMapMatch(vals);
    const surfType = getSurfTypeMatch(vals);
  
    const cache = getCache();

    const record = cache[surfType][map];
    record.type = surfType;
    await sendWR(m, record);
  
    return;
  } catch (e) {
    console.error(`error at handleWorldRecordCMD:\n${e.message}\n\n${e.stack}`);
    m.channel.send('❌ Apologies, something broke. I\'m pinging joe RIGHT now.');
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}> Error @ handleWorldRecordCMD:
      ${e.message}
      ${e.stack}`
    }));
  }
}

async function sendWR (m, rec) {
  await m.react('✅');
  const title = `✅ Current ${rec.type} record for ${rec.map}\n`
  const bod = '```'+`${rec.name}\n${rec.time}`+'```';

  const msg = title + bod + rec.vid;
  await m.channel.send(msg);

  return;
}
