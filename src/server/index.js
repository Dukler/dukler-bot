
async function getGameServer(command) {
    const { game, params, message } = command;
    const server = await (await import(`./${game}/index.js`)).default
    return server
}

function newGameServer(config) {
    const SM = require('./manager/ServerManager');
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
                    // 60000
                    checkingPlayers = setTimeout(checkPlayers, 60000);
                } else {
                    console.log('El servidor se apago');
                    stop();
                }
            }
        })();
    }

    const start = (params, channel) => {
        channel.send('Server starting... ');
        // serverManager.setup(config, channel);
        serverManager.start(
            ()=>{
                if (config.start.notifyDiscord) {
                    channel.send(`${config.server.name} server has started!`);
                }
                if (config.autoShutdown) autoShutdown()
            },
            ()=>{
                if (config.stop.notifyDiscord) {
                    channel.send(`${config.server.name} server has stopped!`);
                }
            },
        );
    }
    const stop = (params, channel) => {
        serverManager.write(config.stop.cmd);
    }

    const restart = (params, channel) => {
        stop(params, channel)
        function checkFlag() {
            if (serverManager.serverRunning === true) {
                setTimeout(checkFlag, 100);
            } else {
                /* do something*/
                start(params, channel)
            }
        }
        checkFlag();
    }

    return { start, stop, restart }
}

module.exports = {
    newGameServer,
    getGameServer,
}
// module.exports = {
//     newGameServer,
//     getGameServer
// }