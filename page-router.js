const getRecordsSheet = require('./util/records-sheet');
const { getCache } = require('./util/cache');
const { getPBCache } = require('./util/pb-sheet');
const { getDiscordUsers } = require('./util/discord-users-route');

module.exports = pageRouter;

/*
  weird router
  weird data loading
  templating is kinda fun tho?
 */


function pageRouter (discordClient) {
  const PAGES = [
    'logs',
    'leaderboard',
    'personal-bests',
    'users'
  ];
  return async (req, res) => {
    const hasEquals = req.url.includes('=');
    const pageQuery = req.url.split('=')[1];
    const hasPage = PAGES.includes(pageQuery);
    const badReq = !hasEquals || !pageQuery || !hasPage
    if(badReq) {
      res.render('main.ejs', {title: 'Hi there surfer, looks like you\'re lost'});
      return;
    }
  
    switch(pageQuery) {
      case 'logs':
        const recordSheet = await getRecordsSheet();
        const logData = recordSheet.map(sd => {
          const arr = sd.data.split(', ')
          return {
            user: arr[0],
            time: arr[1],
            link: arr[2],
            map: arr[3],
            type: arr[4]
          }
        });
        res.render('logs.ejs', {
          title: 'Search All Submissions',
          data: JSON.stringify(logData)
        });
        break;

      case 'leaderboard':
        const cache = getCache();
        const leaderboard = getLeaderboardData(cache);
        res.render('leaderboard.ejs', {
          title: 'Search Surf Leaderboard',
          data: JSON.stringify(leaderboard)
        });
        break;

      case 'personal-bests':
        const pBcache = getPBCache();
        const personalBests = getPBData(pBcache);
        res.render('pbs.ejs', {
          title: 'Search Personal Bests',
          data: JSON.stringify(personalBests)
        });
        break;

      case 'users':
        const users = await getDiscordUsers(discordClient);
        res.render('users.ejs', {
          title: 'Search Discord Users',
          data: JSON.stringify(users)
        });
        break;

      default:
        console.error(`Error on page-router:\ntried to get to invalid page: ${pageQuery}`);
        res.sendStatus(500);
        break;
    }

    return;
  }
}

function getLeaderboardData (c) {
  const newBoard = [];
  
  // maps are the same for both so
  for (const map in c.Gravspeed) {
    const newG = {
      map: map,
      type: 'Gravspeed',
      user: c.Gravspeed[map].name,
      time: c.Gravspeed[map].time,
      link: c.Gravspeed[map].vid,
    };
    const newS = {
      map: map,
      type: 'Standard',
      user: c.Standard[map].name,
      time: c.Standard[map].time,
      link: c.Standard[map].vid,
    };

    newBoard.push(newS, newG);
  }

  return newBoard;
}

function getPBData (c) {
  const newData = [];

  for (const user in c) {
    for (const gMap in c[user].Gravspeed) {
      newData.push({
        type: 'Gravspeed',
        user: user,
        map: gMap,
        time: c[user].Gravspeed[gMap].time,
        date: c[user].Gravspeed[gMap].timeStamp,
        link: c[user].Gravspeed[gMap].vid,
      });
    }
    for (const sMap in c[user].Standard) {
      newData.push({
        type: 'Standard',
        user: user,
        map: sMap,
        time: c[user].Standard[sMap].time,
        date: c[user].Standard[sMap].timeStamp,
        link: c[user].Standard[sMap].vid,
      });
    }
  }

  return newData;
}