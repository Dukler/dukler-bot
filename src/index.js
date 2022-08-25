// const Discord = require('discord.js');
const { Client, GatewayIntentBits  } = require('discord.js');
const bot = require('./bot')
const process = require('process');



// const client = new Discord.Client({ autoReconnect: true });
const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
], autoReconnect: true });

process.stdin.resume();//so the program will not close instantly


client.once('ready', () => {
    console.log('Ready!');
})

client.on('error', console.error);


// client.on('messageCreate', message => {
//     if (message.member) {
//         if (message.member.roles.cache.find(r => r.name === "bot user")) {
//             if (message.channel.name === "bot" || message.channel.name === "dev") {
//                 const command = bot.getCommandByDiscordMessage(message);
//                 if(command)bot.executeCommand(command);
//             } else if (message.content.includes('!')) {
//                 message.member.send("Ahora hay que usar el canal de texto 'bot' para usar el bot de minecraft.");
//                 message.member.send("Tu comando fue rechazado.");
//                 message.delete();
//             }
//         }

//     }
// });

client.on('interactionCreate', interaction => {
    // console.log(interaction)
    if (!interaction.isChatInputCommand()) return;
    const message = interaction;
    if (message.member) {
        const command = bot.getCommandByDiscordMessage(message);
        if(command)bot.executeCommand(command);
        // if (message.member.roles.cache.find(r => r.name === "bot user")) {
        //     const command = bot.getCommandByDiscordMessage(message);
        //     if(command)bot.executeCommand(command);
        // }

    }
});


client.login(process.env.TOKEN);


