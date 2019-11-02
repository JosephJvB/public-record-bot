const stringSimilarity = require('string-similarity');

module.exports = {
  getGSheetMapName,
  getColName,
  getMapMatch,
  getSubmitMapName,
  getSurfType,
  getSurfTypeMatch,
  isSubmitMap,
  isSurfType,
  getEmojiFromNum,
  getNumFromEmoji
}

// for checking world record leaderboard

function getGSheetMapName(m) {
  switch(m) {
    case '7': return "Hanamura";
    case '8': return "Horizon Lunar Colony";
    case '9': return "Paris";
    case '10': return "Temple of Anubis";
    case '11': return "Volskaya Industries";
    case '12': return "Dorado";
    case '13': return "Havana";
    case '14': return "Junkertown";
    case '15': return "Rialto";
    case '16': return "Route 66";
    case '17': return "Gibraltar";
    case '18': return "Blizzard World";
    case '19': return "Eichenwalde";
    case '20': return "Hollywood";
    case '21': return "King's Row";
    case '22': return "Numbani";
    case '23': return "Busan Sanctuary";
    case '24': return "Busan MEKA Base";
    case '25': return "Busan Downtown";
    case '26': return "Ilios Well";
    case '27': return "Ilios Ruins";
    case '28': return "Ilios Lighthouse";
    case '29': return "Lijiang Night Market";
    case '30': return "Lijiang Garden";
    case '31': return "Lijiang Control Center";
    case '32': return "Nepal Village";
    case '33': return "Nepal Sanctum";
    case '34': return "Nepal Shrine";
    case '35': return "Oasis City Center";
    case '36': return "Oasis University";
    case '37': return "Oasis Gardens";
    default: throw new Error('bad map name: ' + m);
  }
}

function getColName (c) {
  switch(c) {
    case '1':
    case '7': return 'map';
    case '2':
    case '8': return 'time';
    case '3':
    case '9': return 'name';
    case '4':
    case '10': return 'vid';
    default: throw new Error('couldnt get column name: ' + c)
  }
}

// for !submit discord command

// makes sure that the map name is consistent with g-sheet
function getSubmitMapName(str) {
  const s = str.toLowerCase().replace(/'/gi, '').replace(/ /gi, '').replace(/:/gi, '');
  switch(s) {
    case "hanamura": return "Hanamura";
    case "horizonlunarcolony": return "Horizon Lunar Colony";
    case "paris": return "Paris";
    case "templeofanubis": return "Temple of Anubis";
    case "volskayaindustries": return "Volskaya Industries";
    case "dorado": return "Dorado";
    case "havana": return "Havana";
    case "junkertown": return "Junkertown";
    case "rialto": return "Rialto";
    case "route66": return "Route 66";
    case "watchpointgibraltar":
    case "gibraltar": return "Gibraltar";
    case "blizzardworld": return "Blizzard World";
    case "eichenwalde": return "Eichenwalde";
    case "hollywood": return "Hollywood";
    case "kingsrow": return "King's Row";
    case "numbani": return "Numbani";
    case "busansanctuary": return "Busan Sanctuary";
    case "busanmekabase": return "Busan MEKA Base";
    case "busandowntown": return "Busan Downtown";
    // handle double 'l' ilios
    case "illioswell":
    case "ilioswell": return "Ilios Well";
    case "illiosruins":
    case "iliosruins": return "Ilios Ruins";
    case "illioslighthouse":
    case "ilioslighthouse": return "Ilios Lighthouse";
    // handle missing second 'i' lijiang
    case "lijangnightmarket":
    case "lijiangnightmarket": return "Lijiang Night Market";
    // handle garden with trailing 's'
    case "lijanggarden":
    case "lijanggardens":
    case "lijianggardens":
    case "lijianggarden": return "Lijiang Garden";
    case "lijangcontrolcenter":
    case "lijiangcontrolcenter": return "Lijiang Control Center";
    case "nepalvillage": return "Nepal Village";
    case "nepalsanctum": return "Nepal Sanctum";
    case "nepalshrine": return "Nepal Shrine";
    case "oasiscitycenter": return "Oasis City Center";
    case "oasisuniversity": return "Oasis University";
    case "oasisgarden":
    case "oasisgardens": return "Oasis Gardens";
    default: throw new Error('Unrecognized map name: ' + str);
  }
}

function isSubmitMap(str) {
  const s = str.toLowerCase().replace(/\'/gi, '').replace(/ /gi, '').replace(/:/gi, '');
  const mapNames = [
    "hanamura",
    "horizonlunarcolony",
    "paris",
    "templeofanubis",
    "volskayaindustries",
    "dorado",
    "havana",
    "junkertown",
    "rialto",
    "route66",
    "gibraltar",
    "watchpointgibraltar",
    "blizzardworld",
    "eichenwalde",
    "hollywood",
    "kingsrow",
    "kingsrow",
    "numbani",
    "busansanctuary",
    "busanmekabase",
    "busandowntown",
    "ilioswell",
    "illioswell",
    "iliosruins",
    "illiosruins",
    "ilioslighthouse",
    "illioslighthouse",
    "lijiangnightmarket",
    "lijangnightmarket",
    "lijianggarden",
    "lijanggarden",
    "lijianggardens",
    "lijanggardens",
    "lijiangcontrolcenter",
    "lijangcontrolcenter",
    "nepalvillage",
    "nepalsanctum",
    "nepalshrine",
    "oasiscitycenter",
    "oasisuniversity",
    "oasisgarden",
    "oasisgardens"
  ];
  return mapNames.includes(s);
}
function getMapMatch (msgContentArr) {
  const mapNames = [
    "Hanamura",
    "Horizon Lunar Colony",
    "Paris",
    "Temple of Anubis",
    "Volskaya Industries",
    "Dorado",
    "Havana",
    "Junkertown",
    "Rialto",
    "Route 66",
    "Gibraltar",
    "Blizzard World",
    "Eichenwalde",
    "Hollywood",
    "King's Row",
    "Numbani",
    "Busan Sanctuary",
    "Busan MEKA Base",
    "Busan Downtown",
    "Ilios Well",
    "Ilios Ruins",
    "Ilios Lighthouse",
    "Lijiang Night Market",
    "Lijiang Garden",
    "Lijiang Control Center",
    "Nepal Village",
    "Nepal Sanctum",
    "Nepal Shrine",
    "Oasis City Center",
    "Oasis University",
    "Oasis Gardens"
  ];
  const sugg = msgContentArr.reduce((current, next) => {
    const match = stringSimilarity.findBestMatch(next, mapNames).bestMatch;
    return current.rating > match.rating
      ? current
      : match;
  }, {rating: 0, target: ''});

  return sugg.target;
}

function getSurfTypeMatch (msgContentArr) {
  const surfTypes = ['gravspeed', 'standard', 'grav'];
  const best = msgContentArr.reduce((current, next) => {
    const match = stringSimilarity.findBestMatch(next, surfTypes).bestMatch;
    return current.rating > match.rating
      ? current
      : match;
  }, {rating: 0, target: ''});

  if(best.target[0] === 'g') return 'Gravspeed';
  else return 'Standard';
}

function isSurfType (str) {
  const s = str.toLowerCase();
  return (s === 'standard' || s === 'gravspeed');
}

function getSurfType (str) {
  const s = str.toLowerCase();
  if(s === 'standard') return 'Standard';
  if(s === 'gravspeed') return 'Gravspeed';
  else throw new Error('mode not recognized: '+str);
}

//0⃣ 1⃣ 2⃣ 3⃣ 4⃣ 5⃣ 6⃣ 7⃣ 8⃣ 9⃣
function getEmojiFromNum (n) {
  switch(n) {
    case 0: return '0⃣';
    case 1: return '1⃣';
    case 2: return '2⃣';
    case 3: return '3⃣';
    case 4: return '4⃣';
    case 5: return '5⃣';
    case 6: return '6⃣';
    case 7: return '7⃣';
    case 8: return '8⃣';
    case 9: return '9⃣';
    default: throw new Error('Dont have that number');
  }
}
function getNumFromEmoji (e) {
  switch(e) {
    case '0⃣': return 0;
    case '1⃣': return 1;
    case '2⃣': return 2;
    case '3⃣': return 3;
    case '4⃣': return 4;
    case '5⃣': return 5;
    case '6⃣': return 6;
    case '7⃣': return 7;
    case '8⃣': return 8;
    case '9⃣': return 9;
    default: throw new Error('Dont have that emoji');
  }
}