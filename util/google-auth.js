const { JWT } = require("google-auth-library"); 

module.exports = {
  getGoogleAuth,
  setGoogleAuth
}

let googleAUTH;
let jwtClient;

async function setGoogleAuth () {
  if(!jwtClient) await setClient();
  googleAUTH = await jwtClient.authorize();

  return;
}

async function getGoogleAuth () {
  const needRefresh = !googleAUTH
  || !googleAUTH.access_token
  || googleAUTH.expiry_date < new Date();
  if(needRefresh) {
    await setGoogleAuth();
  }

  return `Bearer ${googleAUTH.access_token}`;
}

async function setClient () {
  jwtClient = new JWT(
    process.env.googEMAIL,
    null,// keyfile
    process.env.googKEY,
    // im sending delete requests to: https://spreadsheets.google.com/feeds/list/
    // assume I need this to auth those requests
    ["https://spreadsheets.google.com/feeds"]
  );
  return;
}