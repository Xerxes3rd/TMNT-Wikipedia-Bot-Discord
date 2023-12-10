const { AttachmentBuilder } = require( 'discord.js' )
const { getTMNTWikiLogo } = require( './tmntWikiLogo.js' )

const dailyKeyName = 'daily'

async function setScheduledPost( keyv, guildId, channelId ) {
  if ( keyv && guildId ) {
    let daily = await keyv.get( dailyKeyName )
    if ( !daily ) {
      daily = {}
    }
    if ( channelId ) {
      daily[guildId] = { channelId }
    } else {
      delete daily[guildId]
    }
    await keyv.set( dailyKeyName, daily )
    const v = await keyv.get( guildId )
    if ( v ) {
      console.log( v )
    }
    return
  }
}

async function addScheduledPost( keyv, guildId, channelId ) {
  await setScheduledPost( keyv, guildId, channelId )
}

async function removeScheduledPost( keyv, guildId ) {
  await setScheduledPost( keyv, guildId )
}

async function doDailyPost( keyv, client ) {
  if ( !keyv ) {
    return
  }

  const daily = await keyv.get( dailyKeyName )
  const guildIds = daily ? Object.keys( daily ) : []

  if ( !guildIds.length ) {
    console.log( 'No guilds have daily settings' )
    return
  }

  console.log( 'Getting daily TMNT wiki logo' )
  const { result, pageTitle, url, pagesChecked, buf } = await getTMNTWikiLogo()

  let msg
  if ( result ) {
    console.log( `Daily post: searched ${pagesChecked} pages and found "${pageTitle} at ${url}"` )
    const attachment = new AttachmentBuilder( buf, { name: 'tmnt-wiki-image.png', description: url } )
    msg = { body: url, files: [attachment] }
  } else {
    console.log( `Daily post: searched ${pagesChecked} pages and could not find any TMNT-worthy pages` )
    msg = `Bummer dude, I searched through ${pagesChecked} Wiki pages and couldn't find any that were TMNT-worthy`
  }

  const promises = []
  for ( let i = 0; i < guildIds.length; i++ ) {
    const guildId = guildIds[i]
    const guildData = daily[guildId]
    const channelId = guildData?.channelId
    if ( guildId && channelId ) {
      const channel = client?.channels?.cache?.get( channelId )
      if ( channel ) {
        promises.push( channel.send( msg ) )
      }
    }
  }

  if ( promises.length ) {
    await Promise.all( promises )
  }
}

module.exports = { addScheduledPost, removeScheduledPost, doDailyPost }