const { SlashCommandBuilder } = require('discord.js');
const { getCurrentGames } = require('../server')

const options = option => option.setName('game')
    .setDescription('Select game')
    .setRequired(true)
    .addChoices(
        ...getCurrentGames()
    )

const start = new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start game server')
    .addStringOption(options)

const stop = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop game server')
    .addStringOption(options)
    
const restart = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restart game server')
    .addStringOption(options)


module.exports = {
    start,
    stop,
    restart
}