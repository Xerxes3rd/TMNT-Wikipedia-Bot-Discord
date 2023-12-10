const { SlashCommandBuilder } = require( 'discord.js' )
const { logInteraction } = require( './commandsUtils.js' )

BigInt.prototype.toJSON = function() { return this.toString() }

module.exports = [ {
  data: new SlashCommandBuilder()
    .setName( 'tmnt-ping' )
    .setDescription( 'Replies with Pong!' ),
  async execute( interaction ) {
    logInteraction( 'ping', interaction )
    console.log( JSON.stringify( interaction ) )
    try {
      await interaction.reply( 'Pong!' )
    } catch ( ex ) {
      console.log( `Error sending reply: ${JSON.stringify( ex )}` )
    }
  },
} ]