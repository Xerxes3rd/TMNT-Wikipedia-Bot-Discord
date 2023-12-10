const { SlashCommandBuilder, AttachmentBuilder, ChannelType, PermissionFlagsBits } = require( 'discord.js' )
const { makeTMNTLogo } = require( '../tmntLogo.js' )
const { getTMNTWikiLogo } = require( '../tmntWikiLogo.js' )
const { logInteraction } = require( './commandsUtils.js' )

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName( 'tmnt-ize' )
      .setDescription( 'TMNT-izes a phrase!' )
      .addStringOption( option => option
        .setName( 'phrase' )
        .setDescription( 'Quoted phrase to TMNT-ize' )
        .setRequired( true ) ),
    async execute( interaction ) {
      const phrase = interaction.options.getString( 'phrase' )

      logInteraction( `logo request for phrase "${phrase}"`, interaction )

      if ( !phrase ) {
        await interaction.reply( 'No phrase provided' )
        return
      }

      try {
        await interaction.deferReply()
      } catch ( ex ) {
        console.log( `Error calling deferReply in tmnt-ize: ${JSON.stringify( ex )}` )
        return
      }

      const buf = await makeTMNTLogo( phrase )
      const attachment = new AttachmentBuilder( buf, { name: 'tmnt-ized-image.png', description: phrase } )

      try {
        await interaction.editReply( { files: [attachment] } )
      } catch ( ex ) {
        console.log( `Error sending TMNT-ized image: ${JSON.stringify( ex )}` )
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName( 'tmnt-wiki' )
      .setDescription( 'Get a Wikipedia TMNT article!' ),
    async execute( interaction ) {
      try {
        await interaction.deferReply()
      } catch ( ex ) {
        console.log( `Error calling deferReply in tmnt-wiki: ${JSON.stringify( ex )}` )
        return
      }
      logInteraction( 'get Wiki logo', interaction )
      const { result, pageTitle, url, pagesChecked, buf } = await getTMNTWikiLogo()

      if ( result ) {
        console.log( `Title: ${pageTitle}, URL: ${url} (checked ${pagesChecked} pages)` )
        const attachment = new AttachmentBuilder( buf, { name: 'tmnt-wiki-image.png', description: url } )
        try {
          await interaction.editReply( { body: url, files: [attachment] } )
        } catch ( ex ) {
          console.log( `Error sending TMNT wiki image: ${JSON.stringify( ex )}` )
        }
      } else {
        console.log( `Failure: checked ${pagesChecked} pages and none matched` )
        await interaction.editReply( `Bummer, dude!  I checked ${pagesChecked} pages and none were worthy of TMNT` )
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName( 'tmnt-daily' )
      .setDescription( 'Sets the channel to post the daily TMNT image into' )
      .setDefaultMemberPermissions( PermissionFlagsBits.ManageChannels )
      .addChannelOption( option => option
        .setName( 'channel' )
        .setDescription( 'Channel name' )
        .addChannelTypes( ChannelType.GuildText )
        .setRequired( true ) ),
    async execute( interaction ) {
      try {
        await interaction.deferReply()
      } catch ( ex ) {
        console.log( `Error calling deferReply in tmnt-daily: ${JSON.stringify( ex )}` )
        return
      }
      const channel = interaction?.options?.data[0]?.channel
      const guildId = channel?.guildId
      const channelId = channel?.id
      const channelName = channel.name
      logInteraction( `set daily channel to ${channelName} (${guildId}:${channelId})`, interaction )

      try {
        await interaction.editReply( `Set daily TMNT posting channel to ${channel}` )
      } catch ( ex ) {
        console.log( `Error sending TMNT daily response: ${JSON.stringify( ex )}` )
      }
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName( 'tmnt-daily-disable' )
      .setDescription( 'Disables the daily TMNT image post' )
      .setDefaultMemberPermissions( PermissionFlagsBits.ManageChannels ),
    async execute( interaction ) {
      try {
        await interaction.deferReply()
      } catch ( ex ) {
        console.log( `Error calling deferReply in tmnt-daily-disable: ${JSON.stringify( ex )}` )
        return
      }
      const guild = interaction?.guild
      const guildId = guild?.id
      const guildName = guild?.name
      logInteraction( `disabling daily channel for guild ${guildName} (ID: ${guildId})`, interaction )

      try {
        await interaction.editReply( 'Disabled daily TMNT posting' )
      } catch ( ex ) {
        console.log( `Error sending TMNT daily disable response: ${JSON.stringify( ex )}` )
      }
    },
  },
]
