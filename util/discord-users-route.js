// haha this is what technical debt looks like
module.exports = handleUsers;
module.exports.getDiscordUsers = getDiscordUsers;

function handleUsers (discordClient) {
  return async (req, res) => {
    if(req.query.auth !== process.env.joeAUTH) {
      res.sendStatus(403);
      return;
    }
    const jsonUsers = await getDiscordUsers(discordClient);

    res.status(200).json(jsonUsers);

    return;
  }
}

async function getDiscordUsers (discordClient) {
  const guild = discordClient.guilds.get(process.env.surfGUILD);
    const guildWithMembers = await guild.fetchMembers();
    const jsonUsers = guildWithMembers.members.map(m => {
      return {
        id: m.id,
        user: `${m.user.username}#${m.user.discriminator}`,
        roles: m.roles.map(r => r.name)
      }
    });

    return jsonUsers;
}