const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const standardCommands = require ('./standardCommands')
const utilityCommands = require ('./utilityCommands')

const commands = [];


// for (const commands of standardCommands) {
// 	const filePath = path.join(commandsPath, file);
// 	const command = require(filePath);
// 	commands.push(command.data.toJSON());
// }

for (const key of Object.keys(standardCommands)) {
	commands.push(standardCommands[key].toJSON());
}

for (const key of Object.keys(utilityCommands)) {
	commands.push(utilityCommands[key].toJSON());
}


const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);