const axios = require('axios');
const xml2js = require('xml2js');

module.exports = {
  getPBCache,
  setPBCache
}

let pbCache = {};
// pbCache[user][surfType][map] = {user, map, time, vid, timestamp}
// some values kinda redundant but...

function getPBCache () {
  return pbCache;
}

function setPBCache () {
  return new Promise(async (resolve, reject) => {
    const response = await axios.get(process.env.pbSHEET);
    var xml_parser = new xml2js.Parser({
      explicitArray: false,
      explicitRoot: false
    });
    xml_parser.parseString(response.data, function(err, result){
      if(err) {
        reject(err);
        return;
      }
  
      // construct cache from result data
      // kinda like a budget reduce!
      let tempRecord = {};
      for(const cell of result.entry) {
        const coords = cell['gs:cell']['$'];
        const val = cell['gs:cell']['_'];
  
        const colName = getColName(coords.col);
        tempRecord[colName] = val;
        
        if(colName === 'vid') { // we at the final 'value' of a row
          // some buggy records, dupes and missing time values
          // only add records to cache with time value
          if(tempRecord.time) {
            if(!pbCache[tempRecord.user]) {
              pbCache[tempRecord.user] = {
                Gravspeed: {},
                Standard: {}
              };
            }
            const surfType = Number(coords.col) > 6 ? 'Gravspeed' : 'Standard';
            pbCache[tempRecord.user][surfType][tempRecord.map] = tempRecord;
          } 
          // if colname is vid, reset tempRecord
          tempRecord = {};
        }
      }

      resolve(true);
    })
  })
}


function getColName (c) {
  switch(c) {
    case '1':
    case '7': return 'user'
    case '2':
    case '8': return 'map'
    case '3':
    case '9': return 'time'
    case '4':
    case '10': return 'timeStamp'
    case '5':
    case '11': return 'vid'
    default: throw new Error('./util/pb-sheet.js line 64: Col number bad at getColName');
  }
}