const axios = require('axios');

const { getPBCache } = require('../util/pb-sheet');
const { getMapMatch, getSurfTypeMatch } = require('../util/switches');

module.exports = handlePersonalBestCMD;

const helpText = '**how 2 lookup your personal best records**\n\nSearch for your PB for a map, and surf-mode. eg:```!pb lijiang garden grav```*\*Please include "standard" or "grav" to make sure you get the right record!*\n\nHappy surfing 🏄‍'

async function handlePersonalBestCMD (m) {
  try {
    const contentRaw = m.content.replace('!pb', '').replace(/ /gi, '');
    if(!contentRaw) return;

    const msgContentArr = contentRaw.split(',').map(i => i.trim().toLowerCase());
    if(msgContentArr.includes('help')) {
      await m.channel.send(helpText);
      return;
    }

    const user = `${m.author.username}#${m.author.discriminator}`;
    const surfType = getSurfTypeMatch(msgContentArr);
    const map = getMapMatch(msgContentArr);
    const pbCache = getPBCache();

    if(!pbCache[user]) {
      m.react('❌');
      await m.channel.send(`❌ No records found for ${user}\nGet out there and start surfing!! 🏄`);
      return;
    }
    const record = pbCache[user][surfType][map];
    if(!record) {
      m.react('❌');
      await m.channel.send(`❌ No records found for ${user}`+'```'+`${surfType}, ${map}`+'```');
      return;
    }

    await m.react('✅');
    const pBMsg = '✅ PB found:```'+`\n${surfType}\n${record.user}\n${record.map}\n${record.time}`+'```'+record.vid;
    await m.channel.send(pBMsg);

    return;
  } catch (e) {
    console.error(`error at handlePersonalBestCMD:\n${e.message}\n\n${e.stack}`);
    m.channel.send('❌ Apologies, something broke. I\'m pinging joe RIGHT now.');
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}> Error @ handlePersonalBestCMD:
      ${e.message}
      ${e.stack}`
    }));
  }
}
