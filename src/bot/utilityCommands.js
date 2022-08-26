const { SlashCommandBuilder } = require('discord.js');
const configs = require('../server/connections.json');

const connectionOptions = option => option.setName('server')
    .setDescription('Select server')
    .setRequired(true)
    .addChoices(
        
        ...Object.keys(configs)
        .filter(server => {
            return !configs[server].disabled
        })
        .map(key=>{
            return{name:key, value:key}
        })
    )

const java = new SlashCommandBuilder()
    .setName('java')
    .setDescription('Kill java')
    .addStringOption(connectionOptions)

module.exports={
    java
}