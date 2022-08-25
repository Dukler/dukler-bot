const { SlashCommandBuilder } = require('discord.js');

const connectionOptions = option => option.setName('server')
    .setDescription('Select server')
    .setRequired(true)
    .addChoices(
        ...Object.keys(require('../server/connections.json')).map(key=>{return{name:key, value:key}})
    )

const java = new SlashCommandBuilder()
    .setName('java')
    .setDescription('Kill java')
    .addStringOption(connectionOptions)

module.exports={
    java
}