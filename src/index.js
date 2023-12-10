const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require( 'discord.js' )
const Keyv = require( 'keyv' )
const { CronJob } = require( 'cron' )
const { token, clientId, guildId } = require( './config.json' )
const utilityCommands = require( './commands/utility.js' )
const tmntCommands = require( './commands/tmnt.js' )
const { doDailyPost } = require( './keyvHelper.js' )

async function loadCommands( client, keyv ) {
  client.commands = new Collection()
  for ( const command of utilityCommands ) {
    client.commands.set( command.data.name, command )
    command.keyv = keyv
  }
  for ( const command of tmntCommands ) {
    client.commands.set( command.data.name, command )
    command.keyv = keyv
  }
}

async function updateSlashCommands( client ) {
  const commands = client.commands.map( command => command.data.toJSON() )
  const rest = new REST().setToken( token )
  try {
    console.log( `Started refreshing ${commands.length} application (/) commands.` )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands( clientId, guildId ),
      { body: commands },
    )

    console.log( `Successfully reloaded ${data.length} application (/) commands.` )
  } catch ( error ) {
    // And of course, make sure you catch and log any errors!
    console.error( error )
  }
}

async function main() {

  const keyv = new Keyv( 'sqlite://./tmnt-wikipedia-bot-db.sqlite' )
  keyv.on( 'error', err => console.error( 'Keyv connection error:', err ) )

  // Create a new client instance
  const client = new Client( { intents: [GatewayIntentBits.Guilds] } )

  loadCommands( client, keyv )

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once( Events.ClientReady, readyClient => {
    updateSlashCommands( client )
    // doDailyPost( keyv, client ) // for testing
    dailyJob.start()
    console.log( `Ready! Logged in as ${readyClient.user.tag}` )
  } )

  client.on( Events.InteractionCreate, async interaction => {
    if ( !interaction.isChatInputCommand() ) return

    const command = interaction.client.commands.get( interaction.commandName )

    if ( !command ) {
      console.error( `No command matching ${interaction.commandName} was found.` )
      return
    }

    try {
      await command.execute( interaction )
    } catch ( error ) {
      console.error( error )
      if ( interaction.replied || interaction.deferred ) {
        await interaction.followUp( { content: 'There was an error while executing this command!', ephemeral: true } )
      } else {
        await interaction.reply( { content: 'There was an error while executing this command!', ephemeral: true } )
      }
    }
  } )

  // Log in to Discord with your client's token
  client.login( token )

  const dailyJob = new CronJob(
    '0 0 8 * * *', // 8 AM
    async function() { doDailyPost( keyv, client ) }, // onTick
    null, // onComplete
    false, // start
    'America/Los_Angeles', // timeZone
    undefined,
    false,
  )
}

main()
