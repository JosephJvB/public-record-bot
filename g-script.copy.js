function myFunction(e) {
  var answers = e.response.getItemResponses();
  var values = {
    surfType: answers[0].getResponse(),
    name: answers[1].getResponse(),
    vid: answers[2].getResponse(),
    time: answers[3].getResponse(),
    map: answers[4].getResponse()
  };
  
  // post to my server
  // 1. logs all submitted records & tag user who submitted. Channel: #record-logs
  // 2. if is world record, post that update too. Channel: #record-updates
  return UrlFetchApp.fetch('https://jvb-surf-bot.herokuapp.com/webhook', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    payload: JSON.stringify(values),
    muteHttpExceptions: true
 });
}