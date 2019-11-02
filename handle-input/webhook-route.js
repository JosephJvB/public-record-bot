const axios = require('axios');
const { getCache, setCache } = require('../util/cache');
const sendWorldRecord = require('../handle-output/send-world-record');
const sendRecordLog = require('../handle-output/send-record-log');

module.exports = handleWebhookRoute;

function handleWebhookRoute (discordClient) {
  return async (req, res) => {
    if(req.query.auth !== process.env.joeAUTH) {
      res.sendStatus(403);
      return;
    }
    try {
      // send log for every submission
      await sendRecordLog(discordClient, req.body);
      // check new record against cache
      const cache = getCache();
      if(isNewRecord(cache, req.body)) {
        console.log(`
          new record:
          ${req.body.surfType}
          ${req.body.map}
          ${req.body.name}
          ${req.body.vid}
        `);
        const data = await getUpdateData(
          discordClient,
          cache,
          req.body
        );
        await sendWorldRecord(data);
        await setCache();
      }
      res.sendStatus(200);
      return;
    } catch (e) {
      console.error(`Error @ /webhook: ${e.message}`);
      await axios.post(process.env.joeHOOK, JSON.stringify({
        content: `<@${process.env.joeUSERID}>\nerror @ /webhook:${e.message}\n\n${e.stack}`
      }));
      res.sendStatus(500);
    }
  }
}

function isNewRecord (cache, newRecord) {
  const oldTime = cache[newRecord.surfType][newRecord.map].time;
  // when season starts, oldTime = 0.00
  // if no record set (oldTime is low AF), it is new record.
  if(Number(oldTime) === 0) return true;
  return Number(newRecord.time) < Number(oldTime);
}

async function getUpdateData (discord, cache, newRecord) {
  const oldRecord = cache[newRecord.surfType][newRecord.map];
  const ids = await getUsersIDs(
    discord,
    oldRecord,
    newRecord
  );

  return {
    ...newRecord,
    newID: ids.new,
    oldID: ids.old,
    oldTime: oldRecord.time,
    oldName: oldRecord.name
  }
}

async function getUsersIDs (c, oldR, newR) {
  const g = c.guilds.get(process.env.surfGUILD);
  const guildWithMembers = await g.fetchMembers();
  const usrs = guildWithMembers.members;

  const oldUsr = usrs.find(m => {
    const { username, discriminator } = m.user;
    return `${username}#${discriminator}` === oldR.name;
  });
  const newUsr = usrs.find(m => {
    const { username, discriminator } = m.user;
    return `${username}#${discriminator}` === newR.name;
  });

  return {
    old: oldUsr ? oldUsr.id : null,
    new: newUsr ? newUsr.id : null,
  };
}