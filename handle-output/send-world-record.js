const axios = require('axios');

module.exports = sendWorldRecord;

async function sendWorldRecord(d) {
  //https://birdie0.github.io/discord-webhooks-guide/discord_webhook.html
  const usr = d.newID ? `<@${d.newID}>` : d.name;
  const msg = {
    content: `New world record by ${usr}!`,
    embeds: [{
      title: d.surfType+' Surf Record',
      //description: '',
      fields: [
        {
          name: 'Map',
          value: d.map,
          inline: true
        },
        {
          name: 'Time',
          value: d.time+'s',
          inline: true
        },
        {
          name: 'Prev record',
          value: d.oldTime+'s by '+d.oldName,
          inline: true
        }
      ],
      // video: { url: d.vid }
    }]
  };
  // embed details
  await axios.post(process.env.surfHOOK, JSON.stringify(msg));
  // plain vid link
  // if record has been taken by a new user, bm old user!
  const vidMsg = d.name !== d.oldName
  ? `${getBM(d)}\n${d.vid}`
  : d.vid
  await axios.post(process.env.surfHOOK, JSON.stringify({
    content: vidMsg
  }));
  return;
}

function getBM (d) {
  const s = [
    'is not gonna like that',
    'you\'re too slow!',
    'it\'s time for a comeback!',
    'get in that surf lobby and win it back!',
    'is still a pretty fast surfer, I guess...',
    'is all washed up!'
  ];

  const r = Math.floor(Math.random() * s.length);
  const u = d.oldID ? `<@${d.oldID}>` : d.oldName;
  return `${u} ${s[r]}\n`;
}