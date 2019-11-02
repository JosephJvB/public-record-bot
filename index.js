const axios = require('axios');
const H = require('helmet');
const path = require('path');
const E = require('express'),
A = E();
const Discord = require('discord.js');
const client = new Discord.Client();

const { getCache, setCache } = require('./util/cache');
const { getPBCache, setPBCache } = require('./util/pb-sheet');
const handleWebhook = require('./handle-input/webhook-route');
const handleMessage = require('./handle-input/discord-message');
const handleUsers = require('./util/discord-users-route');
const getRecordsSheet = require('./util/records-sheet');
const { setGoogleAuth } = require('./util/google-auth');
const pageRouter = require('./page-router');

const P = process.env.PORT || 3000;

A.listen(P, () => console.log('app is dead on port', P))
// return;
// iife for async
(async function init () {
  try {
    A.use(H());
    A.use(E.json());
    A.use(E.static(path.join(__dirname, 'static')));
    A.engine('ejs', require('ejs').renderFile);
    
    if(!process.env.PORT) require('jvb-env')('config.json');
    await Promise.all([
      client.login(process.env.surfBOT),
      setCache(),
      setGoogleAuth(),
      setPBCache()
    ]);
    console.log(`
      ::bot login::
      ::cache set::
      ::gAuth set::
      ::PB cached::
    `);

    client.on('message', handleMessage);

    A.get('/page*', pageRouter(client));

    A.get('/ping', (req, res) => {
      if(req.query.auth !== process.env.joeAUTH) {
        res.sendStatus(403);
        return;
      }
      console.log('\nping\n')
      res.sendStatus(200);
      return;
    })

    A.post('/webhook', handleWebhook(client));
  
    A.get('/leaderboard', (req, res) => {
      if(req.query.auth !== process.env.joeAUTH) {
        res.sendStatus(403);
        return;
      }
      const cache = getCache();
      res.status(200).json(cache);
    });
    
    A.get('/logs', async (req, res) => {
      if(req.query.auth !== process.env.joeAUTH) {
        res.sendStatus(403);
        return;
      }
      const cache = await getRecordsSheet();
      res.status(200).json(cache);
    });

    A.get('/users', handleUsers(client));

    A.get('/pb', (req, res) => {
      if(req.query.auth !== process.env.joeAUTH) {
        res.sendStatus(403);
        return;
      }
      const pbSheet = getPBCache();
      res.status(200).json(pbSheet);
    })
  
    A.get('/', (req, res) => {
      res.render('main.ejs', {title: 'Hi there surfer, looks like you\'re lost'});
      return;
    });

    A.use(async (err, req, res, next) => {
      console.log(`\nExpress caught ERROR :\n${err.message}\n\n${err.stack}`)
      await axios.post(process.env.joeHOOK, JSON.stringify({
        content: `<@${process.env.joeUSERID}>\nerror @ express:\n${err.message}\n\n${err.stack}`
      }));
      res.sendStatus(500);
    });
    
    A.listen(P, () => console.log('up on', P));

    pingSelf();

    return;
  } catch (e) {
    console.error(`\nerror @ init :\n${e.message}\n\n${e.stack}`);
    await axios.post(process.env.joeHOOK, JSON.stringify({
      content: `<@${process.env.joeUSERID}>\nerror @ init:\n${e.message}\n\n${e.stack}`
    }));
    process.exit(1);
  }
})();

// ping every 28min
let bool = false;
function pingSelf () {
  if(!process.env.PORT) return;
  setInterval(async () => {
    // keep auth token fresh, has life of 30min otherwise
    await setGoogleAuth();
    // update cache every second ping
    if(bool) await Promise.all([
      setCache(),
      setPBCache()
    ]);
    bool = !bool;
    axios.get(`https://jvb-surf-bot.herokuapp.com/ping?auth=${process.env.joeAUTH}`);
  }, 1700000);
}

process.on('uncaughtException', async (err) => {
  console.error(`\nUncaught exception: ${err.message}`)
  await axios.post(process.env.joeHOOK, JSON.stringify({
    content: `<@${process.env.joeUSERID}>\nUncaught exception:\n${err.message}\n\n${err.stack}`
  }));
  process.exit(1);
})

process.on('unhandledRejection', async (err) => {
  console.error(`\nUnhandled promise rejection: ${err.message}`)
  await axios.post(process.env.joeHOOK, JSON.stringify({
    content: `<@${process.env.joeUSERID}>\nUnhandled promise rejection:\n${err.message}\n\n${err.stack}`
  }));
  process.exit(1);
})