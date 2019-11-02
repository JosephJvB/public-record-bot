const axios = require('axios');
const xml2js = require('xml2js');

const { getGSheetMapName, getColName } = require('./switches');

module.exports = {
  getCache,
  setCache
}

// taken from ./switches.js
const COLS = ['1', '7', '2', '8', '3', '9', '4', '10'];

let cache;
// cache[surfType][map][value]
function getCache () {
  return cache;
}

function setCache () {
  return new Promise(async (resolve, reject) => {
    // ripped from here:https://github.com/theoephraim/node-google-spreadsheet/blob/master/index.js
    // cant get rows to work
    // const u = 'https://spreadsheets.google.com/feeds/list/1ZWHbz7dM0PIic-jMaDlzP7bIE9hXEGCb97N9_05RExA/1/public/values?start-index=7&max-results=57';
    const r = await axios.get(process.env.surfGSHEET);
    var xml_parser = new xml2js.Parser({
      // options carried over from older version of xml2js
      // might want to update how the code works, but for now this is fine
      explicitArray: false,
      explicitRoot: false
    });
    xml_parser.parseString(r.data, function(err, result){
      if (err) {
        reject(err);
        return;
      }
      const sheet = {
        Gravspeed: {},
        Standard: {}
      };
      for(const cell of result.entry) {
        const coords = cell['gs:cell']['$'];
        const val = cell['gs:cell']['_'];
        if(COLS.includes(coords.col)) {
          const isGrav = Number(coords.col) > 4;
          const type = isGrav ? sheet.Gravspeed : sheet.Standard;
          const map = getGSheetMapName(coords.row);
          if(!type[map]) {
            type[map] = {};
          }
          const colName = getColName(coords.col);
          type[map][colName] = val;
        }
      }
      cache = sheet;
      resolve(true);
    });
  })
}
