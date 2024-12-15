const { Client, Events, GatewayIntentBits, Collection, REST, Routes } = require( 'discord.js' )
const Keyv = require( 'keyv' )
const cron = require( 'node-cron' )
const { token, clientId, guildId } = require( './config.json' )
const tmntCommands = require( './commands/tmnt.js' )
const { doDailyPost } = require( './keyvHelper.js' )

function loadCommands( client, keyv ) {
  client.commands = new Collection()
  const pgmCommands = []
  const publicCommands = []
  for ( const command of tmntCommands ) {
    client.commands.set( command.data.name, command )
    command.keyv = keyv
    if ( command.pgmOnly ) {
      pgmCommands.push( command.data.toJSON() )
    } else {
      publicCommands.push( command.data.toJSON() )
    }
  }

  return { pgmCommands, publicCommands }
}

async function refreshSlashCommands( pgmCommands, publicCommands ) {
  const rest = new REST().setToken( token )
  try {
    console.log( `Started refreshing ${pgmCommands.length} guild-specific (/) commands.` )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands( clientId, guildId ),
      { body: pgmCommands },
    )

    console.log( `Successfully reloaded ${data.length} guild-specific (/) commands.` )
  } catch ( error ) {
    // And of course, make sure you catch and log any errors!
    console.error( error )
  }
  try {
    console.log( `Started refreshing ${publicCommands.length} public (/) commands.` )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands( clientId, guildId ),
      { body: publicCommands },
    )

    console.log( `Successfully reloaded ${data.length} public (/) commands.` )
  } catch ( error ) {
    // And of course, make sure you catch and log any errors!
    console.error( error )
  }
}

async function start( keyv, client, doRefreshSlashCommands = true ) {
  keyv.on( 'error', err => console.error( 'Keyv connection error:', err ) )

  const { pgmCommands, publicCommands } = loadCommands( client, keyv )

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once( Events.ClientReady, readyClient => {
    if ( doRefreshSlashCommands ) {
      refreshSlashCommands( pgmCommands, publicCommands )
    }
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

  client.on( Events.Error, async error => {
    console.error( 'General event error:', error )
  } )

  client.on( Events.ShardError, async error => {
    console.error( 'A websocket connection encountered an error:', error )
  } )

  const dailyJob = cron.schedule(
    '0 8 * * *', // 8 AM
    async () => { await doDailyPost( keyv, client ) }, // onTick
    {
      scheduled: false,
      timezone: 'America/New_York',
    },
  )

  client.login( token )
}

async function main() {

  console.log( 'Starting TMNT Wikipedia bot' )
  const keyv = new Keyv( 'sqlite://./tmnt-wikipedia-bot-db.sqlite' )
  // Create a new client instance
  const client = new Client( { intents: [GatewayIntentBits.Guilds] } )

  await start( keyv, client )
}

main()
