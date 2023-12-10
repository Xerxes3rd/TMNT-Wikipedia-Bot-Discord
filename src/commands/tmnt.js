const { SlashCommandBuilder, AttachmentBuilder } = require( 'discord.js' )
const { makeTMNTLogo } = require( '../tmntLogo.js' )
const { getTMNTWikiLogo } = require( '../tmntWikiLogo.js' )

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

      console.log( `Generating logo for phrase "${phrase}" for ${interaction?.member?.nickname}` )

      if ( !phrase ) {
        await interaction.reply( 'No phrase provided' )
        return
      }

      await interaction.deferReply()

      console.log( `Generating TMNT logo for ${phrase}` )

      const buf = await makeTMNTLogo( phrase )

      // Use the helpful Attachment class structure to process the file for you
      const attachment = new AttachmentBuilder( buf, { name: 'tmnt-ized-image.png', description: phrase } )

      await interaction.editReply( { files: [attachment] } )
    },
  },
  {
    data: new SlashCommandBuilder()
      .setName( 'tmnt-wiki' )
      .setDescription( 'Get a Wikipedia TMNT article!' ),
    async execute( interaction ) {
      await interaction.deferReply()
      console.log( `Getting Wiki logo for ${interaction?.member?.nickname}` )
      const { result, pageTitle, url, pagesChecked, buf } = await getTMNTWikiLogo()

      if ( result ) {
        console.log( `Title: ${pageTitle}, URL: ${url} (checked ${pagesChecked} pages)` )
        const attachment = new AttachmentBuilder( buf, { name: 'tmnt-wiki-image.png', description: url } )
        await interaction.editReply( { body: url, files: [attachment] } )
      }
      else {
        console.log( `Failure: checked ${pagesChecked} pages and none matched` )
        await interaction.editReply( `Bummer, dude!  I checked ${pagesChecked} pages and none were worthy of TMNT` )
      }
    },
  },
]
