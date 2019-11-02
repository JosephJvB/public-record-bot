const {
  isSubmitMap,
  isSurfType,
  getSubmitMapName,
  getSurfType,
} = require('./switches');

module.exports = recordFilter;

function recordFilter (msg) {
  const msgVals = getValues(msg.content.replace('!delete', ''));
  return (r, i) => {
    const isRecordOwner = r.data.includes(`${msg.author.username}#${msg.author.discriminator}`);
    const isModPlus = msg.member.roles.has(process.env.modROLE)
    || msg.member.roles.has(process.env.adminROLE);
    // mods + admins can delete any record
    // users can only delete their own records
    if(!isModPlus && !isRecordOwner) {
      return false;
    }

    const recVals = getValues(r.data);
    // does this work???? it does!!
    // filter results if user includes `!delete [queryValue]`
    return (msgVals.link ? recVals.link === msgVals.link : true)
    && (msgVals.mode ? recVals.mode === msgVals.mode : true)
    && (msgVals.map ? recVals.map === msgVals.map : true)
    && (msgVals.time ? recVals.time === msgVals.time : true)
    && (msgVals.user ? recVals.user === msgVals.user : true);
  }
}

function getValues (str) {
  const valArr = str.split(',').map(i => i.trim());
  const values = {};
  for(const val of valArr) {
    if (val.includes('://')) values.link = val;
    else if (isUser(val)) values.user = val;
    else if (isSubmitMap(val)) values.map = getSubmitMapName(val);
    else if (isSurfType(val)) values.mode = getSurfType(val);
    else if (parseFloat(val)) values.time = val;
  }

  return values;
}

function isUser (str) {
  // name eg: charcharchar#1234
  // split at #, look at last item = handle hash in users name
  if(!str.includes('#')) return false;
  const arr = str.split('#');
  const userNumberDiscriminator = arr[arr.length - 1];
  // return true if discrimiator string can be parsed as number and is 4 char long.
  return !!Number(userNumberDiscriminator)
  && userNumberDiscriminator.length === 4;
}