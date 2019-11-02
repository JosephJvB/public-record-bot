const axios = require('axios');
const xml2js = require('xml2js');

const { getGoogleAuth } = require('./google-auth');

module.exports = getRecordsSheet;

async function getRecordsSheet () {
  return new Promise(async (resolve, reject) => {
    // dont need auth to read sheet
    // but do need auth to read sheet and get urls to delete rows @ line 30 & 34
    const gAuth = await getGoogleAuth();

    const r = await axios.get(process.env.recordSHEET, {
      headers: { Authorization: gAuth }
    });
  
    // stolen guts from google-spreadsheet package
    var xml_parser = new xml2js.Parser({
      explicitArray: false,
      explicitRoot: false
    });
    xml_parser.parseString(r.data, function(err, result){
      if (err) {
        reject(err);
        return;
      }
      const records = [];
      for(const row of result.entry) {
        const d = row.content['_'].split(', ').map(p => p.split(': ')[1]).join(', ');
        const link = row.link.find(l => {
          return l['$'].rel === 'edit'
        });
        records.push({
          url: link['$'].href,
          data: d
        })
      }

      resolve(records);
    });
  })
}