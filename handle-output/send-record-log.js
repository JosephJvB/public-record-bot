const axios = require('axios');

module.exports = sendRecordLog;

async function sendRecordLog (client, data) {
  try {
    const userID = await getUsersID(client, data);
    const logData = {
      ...data,
      userID
    };
    const log = getLog(logData);
    await axios.post(process.env.logHOOK, JSON.stringify({
      content: log
    }));
    return;
  } catch (e) {
    console.error(`error at send-record-log:\n${e.message}\n\n${e.stack}`);
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}> Error @ send-record-log:
      ${e.message}
      ${e.stack}`
    }));
  }
}

async function getUsersID (c, d) {
  const g = c.guilds.get(process.env.surfGUILD);
  const guildWithMembers = await g.fetchMembers();
  const usrs = guildWithMembers.members;

  const foundUser = usrs.find(m => {
    const { username, discriminator } = m.user;
    return `${username}#${discriminator}` === d.name;
  });
  return foundUser ? foundUser.id : false;
}

function getLog (vals) {
  // get date
  // tag user if their ID was found
  const now = new Date();
  const yr = now.getDate() + '/' + now.getMonth() + '/' + now.getFullYear();
  const mins = now.getMinutes() < 10 ? '0'+now.getMinutes() : now.getMinutes();
  const hr = now.getHours() + ':' + mins;
  const dateFmt = yr + ' ' + hr;
  const tag = vals.userID ? `\n<@${vals.userID}>` : false;
  const body = '```\n'+dateFmt+'\n\n'+vals.surfType+'\n'+vals.name+'\n'+vals.map+'\n'+vals.time+'s```';
  const log = `Record submitted${tag ? tag+'\n'+body : body}${vals.vid}`;

  return log;
}