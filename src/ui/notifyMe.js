const {ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { isAlive } = require('../server/utils');



const customIds = ['notifyNo','notifyYes']


const connections = require('../server/connections.json');



const notifyMeHandler = async (interaction) => {
    if (!customIds.includes(interaction.customId)) return;
    const user = interaction.user;
    
    if (interaction.customId === 'notifyYes'){
        const { getCurrentGames } = require('../server');
        const games = getCurrentGames();
        const message = interaction.message.toString()
        
        let connection = '', game = '';
        games.some(g=>{
            if (message.includes(g.name)){
                game = g.name
                return true;
            }
        })
        Object.keys(connections).some(conn=>{
            if (message.includes(conn)){
                connection = conn
                return true;
            }
        })
        await interaction.update({content:`Cuando se resuelva la conexion con el ${game} te aviso.`,components:[]})
        const host = connections[connection].host
        let alive = false;
        async function checkFlag() {
            if (alive === false) {
                alive = await isAlive(host)
                setTimeout(checkFlag, 120000);
            } else {
                user.send(`Ahi volvio el ${game} capo.`)
            }
        }
        checkFlag();
    }else{
        await interaction.update({content:'Ok.',components:[]})
    }
    
    
    
}


const notifyButtons = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('notifyNo')
            .setLabel('No')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId('notifyYes')
            .setLabel('Si')
            .setStyle(ButtonStyle.Success)
    )

module.exports = {
    notifyButtons,
    notifyMeHandler
}