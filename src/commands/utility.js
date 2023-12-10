const { SlashCommandBuilder } = require( 'discord.js' )

// BigInt.prototype.toJSON = function() { return this.toString() }

module.exports = [ {
  data: new SlashCommandBuilder()
    .setName( 'ping' )
    .setDescription( 'Replies with Pong!' ),
  async execute( interaction ) {
    // console.log( JSON.stringify( interaction ) )
    await interaction.reply( 'Pong!' )
  },
} ]