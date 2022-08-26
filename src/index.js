// const Discord = require('discord.js');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const bot = require('./bot')
const process = require('process');
const { helpModalHandler } = require('./ui/helpModal');
const { type } = require('os');



// const client = new Discord.Client({ autoReconnect: true });
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
], autoReconnect: true });

process.stdin.resume();//so the program will not close instantly


client.once('ready', () => {
    client.user.setPresence({ activities: [{ name: 'Click me!', type: ActivityType.Playing }] });
    console.log('Ready!');
})

client.on('error', console.error);

// const filter = i => i.customId === 'next';

// const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

// collector.on('collect', async i => {
// 	await i.update({ content: 'A button was clicked!', components: [] });
// });


//buttons interactions
client.on('interactionCreate', interaction => {
    if (!interaction.isButton()) return;
    helpModalHandler(interaction)
});

//chat interaction
client.on('interactionCreate', interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = bot.getCommandByDiscordMessage(interaction);
    if(command)bot.executeCommand(command);
});


client.login(process.env.TOKEN);


