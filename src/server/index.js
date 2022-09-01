
const { readdirSync } = require('fs');
const { HelpButtons, HelpEmbed } = require('../ui/helpModal');
const { notifyButtons } = require('../ui/notifyMe');
const { isAlive } = require('./utils');



async function getGameServer({game}) {
    const server = await (await import(`../games/${game}/index.js`)).default
    return server
}
const props = {config:{}, afterServerStopped:()=>{}}

function newGameServer({config, onServerStopped, afterServerStopped}=props) {
    const SM = require('./ServerManager');
    const serverManager = new SM(config);
    const stopTimer = config.autoShutdown.timer;
    const { OS, host, username } = require('./connections.json')[config.server.remote].host;
    // const { OS, host, username } = connections[commandOption]

    const checkAlive = async (interaction) =>{
        if (!await isAlive(host)){
            interaction[send]({
                content:`Hay problemas con la conexion al servidor de ${game} de ${config.server.remote}, si queres te mando un mensaje directo cuando se resuelva.`,
                components: [notifyButtons],
                ephemeral: true
            })
            serverManager.serverRunning = false;
            return false;
        }
        return true
    }

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
                    serverManager.onServerStopped = ()=>{};
                    serverManager.stop()
                }
            }
        })();
    }

    const start = async ({interaction, game}) => {
        const shouldNotify = config.start.notifyDiscord;
        
        
        const send = 'editReply';
        
        if(!await checkAlive(interaction)) return;

        if(serverManager.serverRunning) {
            interaction[send]({
                content:`${config.server.name} server already online!` , ephemeral: true })
            return;
        }
        serverManager.onServerStopped = (code)=>{
            if (code !== 0 && shouldNotify)
                interaction[send]({content:`There was an error starting the ${config.server.name} server`,ephemeral:true});
        }
        
        serverManager.onServerStarting = () =>{
            if (shouldNotify) interaction[send]({content:'Server starting... ' , ephemeral: true });
        }
        serverManager.onServerStarted = () => {
            if (shouldNotify) {
                interaction[send]({content:`${config.server.name} server has started!`, ephemeral: true });
            }
            if (config.autoShutdown) autoShutdown()
        }
        
        serverManager.start();
    }
    const stop = ({interaction, onServerStopped}) => {
        const send = 'editReply';
        if(!serverManager.serverRunning){
            interaction[send]({content:`${config.server.name} server is not running!`,ephemeral:true});
            return
        }
        const shouldNotify = config.stop.notifyDiscord;
        serverManager.onServerStopped = onServerStopped ? (code)=>onServerStopped({code,shouldNotify,interaction}) : (code)=>{
            if (code === 0){
                if (shouldNotify) interaction[send]({content:`${config.server.name} server has stopped!`,ephemeral:true});
            }
        }
        serverManager.stop();
    }

    const restart = async ({interaction}) => {
        const send = 'editReply';
        if(!await checkAlive(interaction)) return;
        serverManager.onServerStarting = ()=> {
            interaction[send]({content:`${config.server.name} server restarting...`,ephemeral:true })
        }
        serverManager.onServerStarted = ()=> {
            interaction[send]({content:`${config.server.name} server started`,ephemeral:true })
        }
        serverManager.onServerStopped = (code) => {
            const {cmd, onFailCMD} = config?.restart;
            if(cmd){
                runRemote({run:[cmd], username, host, onExit:()=>serverManager.start()})
                return;
            }else if(onFailCMD && code !== 0){
                runRemote({run:[cmd], username, host, onExit:()=>serverManager.start()})
                return;
            }else serverManager.start()
        }
        serverManager.stop();
        // stop({restarting:true,interaction})
        
        // function checkFlag() {
        //     if (serverManager.serverRunning === true) {
        //         setTimeout(checkFlag, 100);
        //     } else {
        //         start({restarting:true, interaction})
        //     }
        // }
        // checkFlag();
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

