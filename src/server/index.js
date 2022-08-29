
const { readdirSync } = require('fs');
const { HelpButtons, HelpEmbed } = require('../ui/helpModal');
const { notifyButtons } = require('../ui/notifyMe');
const { isAlive } = require('./utils');


async function getGameServer({game}) {
    const server = await (await import(`../games/${game}/index.js`)).default
    return server
}

function newGameServer(config) {
    const SM = require('./ServerManager');
    const serverManager = new SM(config);
    const stopTimer = config.autoShutdown.timer;

    async function autoShutdown() {
        let counter = 0;
        (async function checkPlayers() {
            if (serverManager.serverRunning) {
                
                if (counter < stopTimer) {
                    if (serverManager.players > 0) {
                        counter = 0;
                    } else {
                        console.log('El servidor se apagara en:', stopTimer - counter + ' minutos \n\r');
                        counter++;
                    }
                    checkingPlayers = setTimeout(checkPlayers, 60000);
                } else {
                    console.log('El servidor se apago');
                    stop({isAutoShutdown:true});
                }
            }
        })();
    }

    const start = async ({restarting, interaction, game}) => {
        const shouldNotify = config.start.notifyDiscord;
        
        const host = require('./connections.json')[config.server.remote].host;
        const send = 'editReply';
        
        
        if (!await isAlive(host)){
            interaction[send]({
                content:`Hay problemas con la conexion al servidor de ${game} de ${config.server.remote}, si queres te mando un mensaje directo cuando se resuelva.`,
                components: [notifyButtons],
                ephemeral: true
            })
            serverManager.serverRunning = false;
            return;
        }

        if(serverManager.serverRunning) {
            interaction[send]({
                content:`${config.server.name} server already online!` , ephemeral: true })
            return;
        }
        
        
        serverManager.start(
            ()=>{
                if (shouldNotify) {
                    if(restarting){
                        interaction[send]({content:`${config.server.name} server restarting...`,ephemeral:true })
                    }else{
                        interaction[send]({content:'Server starting... ' , ephemeral: true });
                    }
                }
            },
            ()=>{
                if (config.start.notifyDiscord) {
                    interaction[send]({content:`${config.server.name} server has started!`, ephemeral: true });
                }
                if (config.autoShutdown) autoShutdown()
            }
        );
    }
    const stop = ({restarting, isAutoShutdown, interaction}) => {
        const send = 'editReply';
        if(!serverManager.serverRunning){
            interaction[send]({content:`${config.server.name} server is not running!`,ephemeral:true});
            return
        }
        const shouldNotify = config.stop.notifyDiscord && !isAutoShutdown && !restarting;
        serverManager.stop(()=>{
            if (shouldNotify) {
                interaction[send]({content:`${config.server.name} server has stopped!`,ephemeral:true});
            }
        });
        serverManager.write(config.stop.cmd);
    }

    const restart = ({interaction}) => {
        stop({restarting:true,interaction})
        
        function checkFlag() {
            if (serverManager.serverRunning === true) {
                setTimeout(checkFlag, 100);
            } else {
                start({restarting:true, interaction})
            }
        }
        checkFlag();
    }

    const write = ({commandString, interaction}) =>{
        if (interaction.member.roles.cache.find(r => r.name === "Game server admin")){
            serverManager.write(commandString)
            interaction.editReply({content:"Command sent.",ephemeral:true})
        }else{
            interaction.editReply({content:"You do not have permissions.",ephemeral:true})
        }
    }

    const help = ({game,interaction}) =>{
        interaction.editReply({embeds:[HelpEmbed({
            game,
            description:serverManager.config.help[0],
            index:1,
            length:serverManager.config.help.length,
        })], ephemeral:true, components:[HelpButtons]})
    }

    return { start, stop, restart, write, help}
}
  
const getCurrentGames = ()=>{
    const source = __dirname + '/../games'
    return readdirSync(source, { withFileTypes: true })
        .filter(dirent => {
            const config = require(`${source}/${dirent.name}/config.json`)
            return dirent.isDirectory() && !config.server.disabled
        })
        .map(dirent => {return {name: dirent.name, value: dirent.name}})
}


module.exports = {
    newGameServer,
    getGameServer,
    getCurrentGames
}

