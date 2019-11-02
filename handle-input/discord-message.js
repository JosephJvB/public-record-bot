const axios = require('axios');
const handleSubmitCMD = require('../handle-output/submit-record');
const handleDeleteCMD = require('../handle-output/delete-record');
const handleWorldRecordCMD = require('../handle-output/lookup-world-record');
const handlePersonalBestCMD = require('../handle-output/lookup-personal-best');

module.exports = handleMessage;

const submitHelpText = '**How 2 submit**```!submit Standard, King\'s Row, 8.03, https://myclip.com```**Must** include Surf-Mode, Map, Time and Link.\n**Must** be seperated by commas.\n\nHappy surfing 🏄‍';
const deleteHelpText = '**How 2 delete**\n**1.**\nDelete from **your last 5** submitted records:```!delete```OR find a **specific record to delete**```!delete Numbani, Gravspeed```\n**2.**\nWhen prompted,  choose the record you want to delete by reacting to the bot message\n1⃣ 2⃣ 3⃣ 4⃣ 5⃣\n\n*\*You cannot delete another users records*\n\nHappy surfing 🏄‍'

async function handleMessage (message) {
  try {
    const shouldRespond = message.content.startsWith('!')
    && !message.author.bot;
    // only respond in delete and submit channel: disabled for !wr command in any channel
    //&& ((message.channel.id === process.env.submitCHANNELID) || (message.channel.id === process.env.deleteCHANNELID));

    if(!shouldRespond) return;

    const cmd = message.content.split(' ')[0].toLowerCase();

    // only submit from submit channel
    // only delete from delete channel
    // only lookup from lookup channel
    switch(message.channel.id) {
      // if we are in submit channel
      case process.env.submitCHANNELID:
        switch(cmd) {
          case '!submit': await handleSubmitCMD(message);
            break;
          case '!help': await message.channel.send(submitHelpText);
            break;
          case '!f': await message.react('🇫');
            break;
          default:
            await message.react('❌');
            message.channel.send('❌ Command not recognised.\n`!help` for submit format');
            return;
        }
        break;
      // if we are in delete channel
      case process.env.deleteCHANNELID:
        switch(cmd) {
          case '!delete': await handleDeleteCMD(message);
            break;
          case '!help': await message.channel.send(deleteHelpText);
            break;
          case '!f': await message.react('🇫');
            break;
          default:
            await message.react('❌');
            message.channel.send('❌ Command not recognised.\n`!help` for delete format');
            return;
        }
        break;
      // lookupcmd handles its own help command..
      // not consistent, maybe change in future
      case process.env.lookupCHANNELID: 
        switch (cmd) {
          case '!wr': await handleWorldRecordCMD(message);
            break;
          case '!pb': await handlePersonalBestCMD(message)
          // dont send unrecognized message otherwise other bots commands will trigger mine too
          default: return;
        }
        break
      // not in a channel that we should respond to
      default: return;
    }
  } catch (e) {
    console.error(`error at handleMessage:\n${e.message}\n\n${e.stack}`);
    await message.react('❌');
    message.channel.send('❌ Apologies, something broke. I\'m pinging joe RIGHT now.');
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}> Error @ handleMessage:
      ${e.message}
      ${e.stack}`
    }));
  }
}
