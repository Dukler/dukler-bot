const Discord = require('discord.js');
const client = new Discord.Client({ autoReconnect: true });
const server = require('./src/server/index')
const process = require('process');

process.stdin.resume();//so the program will not close instantly


client.once('ready', () => {
    console.log('Ready!');
})

client.on('error', console.error);


client.on('message', message => {
    if (message.member) {
        if (message.member.roles.cache.find(r => r.name === "bot user")) {
            if (message.channel.name === "bot" || message.channel.name === "dev") {
                const commmand = server.getCommandByDiscordMessage(message);
                server.executeCommand(commmand);
            } else if (message.content.includes('!')) {
                message.member.send("Ahora hay que usar el canal de texto 'bot' para usar el bot de minecraft.");
                message.member.send("Tu comando fue rechazado.");
                message.delete();
            }
        }

    }
});

client.login('OTk1Njg0Njg4MDQ1ODIyMDQy.Gb_lP1.fv9haVlzpP3I1tRFy2SQg7DRMZCFi0SgLARIE8');


