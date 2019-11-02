module.exports = getErr;

function getErr () {
  const a = [
    'Stop right there criminal scum',
    'Gnarly bail',
    'Rekt',
    'That\'s a no from me dawg',
    'Epic fail xD',
    'Back that ass up',
    'No can do, bucko',
    'Reported to blizzard'
  ];

  const r = Math.floor(Math.random() * a.length);
  return a[r];
}