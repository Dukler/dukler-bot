
const { readdirSync } = require('fs');
const { row, HelpEmbed } = require('../ui/helpModal');


async function getGameServer(command) {
    const { game, params, message } = command;
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

    const start = (params = {}, interaction) => {
        const shouldNotify = config.start.notifyDiscord;
        const {restarting} = params;
        // if(shouldNotify && !restarting) interaction.deferReply({ephemeral:true})
        const send = 'editReply';
        
        if(serverManager.serverRunning) {
            interaction[send]({content:`${config.server.name} server already running!` , ephemeral: true })
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
    const stop = (params = {}, interaction) => {
        const send = 'editReply';
        if(!serverManager.serverRunning){
            // interaction.deferReply({ephemeral:true})
            interaction[send]({content:`${config.server.name} server is not running!`,ephemeral:true});
            return
        }
        const {restarting, isAutoShutdown} = params;
        const shouldNotify = config.stop.notifyDiscord && !isAutoShutdown && !restarting;
        // if(shouldNotify) interaction.deferReply({ephemeral:true})
        serverManager.stop(()=>{
            if (shouldNotify) {
                interaction[send]({content:`${config.server.name} server has stopped!`,ephemeral:true});
            }
        });
        serverManager.write(config.stop.cmd);
    }

    const restart = (params={}, interaction) => {
        //interaction.deferReply({ephemeral:true})
        stop({...params, restarting:true}, interaction)
        
        function checkFlag() {
            if (serverManager.serverRunning === true) {
                setTimeout(checkFlag, 100);
            } else {
                start({...params, restarting:true}, interaction)
            }
        }
        checkFlag();
    }

    const write = (params={},interaction) =>{
        if (interaction.member.roles.cache.find(r => r.name === "Game server admin")){
            serverManager.write(params)
            interaction.editReply({content:"Command sent.",ephemeral:true})
        }else{
            interaction.editReply({content:"You do not have permissions.",ephemeral:true})
        }
    }

    const help = (params={},interaction) =>{
        console.log(interaction)
        interaction.reply({embeds:[HelpEmbed({
            game:params.game,
            description:serverManager.config.help[0],
            index:1,
            length:serverManager.config.help.length,
        })], ephemeral:true, components:[row]})
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
// module.exports = {
//     newGameServer,
//     getGameServer
// }


