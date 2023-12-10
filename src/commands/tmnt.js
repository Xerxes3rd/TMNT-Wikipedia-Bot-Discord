const { SlashCommandBuilder, AttachmentBuilder } = require( 'discord.js' )
const { makeTMNTLogo } = require( '../tmntLogo.js' )
const { getTMNTWikiLogo } = require( '../tmntWikiLogo.js' )
const { logInteraction } = require( './commandsUtils.js' )

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName( 'tmnt-ize' )
      .setDescription( 'TMNT-izes a phrase!' )
      .addStringOption( option =>
        option
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
      }
      else {
        console.log( `Failure: checked ${pagesChecked} pages and none matched` )
        await interaction.editReply( `Bummer, dude!  I checked ${pagesChecked} pages and none were worthy of TMNT` )
      }
    },
  },
]
