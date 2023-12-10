function getMemberInfo( interaction ) {
  return {
    username : interaction?.member?.user?.username,
    nickname : interaction?.member?.nickname,
    guildname : interaction?.guild?.name,
  }
}

function logInteraction( commandInfoStr, interaction ) {
  const { username, nickname, guildname } = getMemberInfo( interaction )
  console.log( `Handling ${commandInfoStr} for ${username} (${nickname}) from ${guildname}` )
}

module.exports = { getMemberInfo, logInteraction }