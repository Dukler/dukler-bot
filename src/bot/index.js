const { getGameServer } = require('../server');


async function executeCommand(command) {
    if (command) {
        const { commandName, game, params, message } = command;
        const props = {game, ...params}
        let server;
        try {
            server = await getGameServer(command)
        } catch (error) {
            return console.error("Game doesn't exists.")
        }
        if (server[commandName] != null) {
            try {
                await message.deferReply({ephemeral:true})
                server[commandName](props, message);
            } catch (error) {
                return console.error(error)
            }
        } else {
            console.error("Command doesn't exists.")
        }
    }
}



const getCommandByDiscordMessage = (message) => {
    
    const getParam = (param) =>{
        const dataArr = message.options.data;
        // return content.split(`${param}:`)[1]?.trim();
        const pos = dataArr.findIndex(i => i.name === param);
        return message.options.data[pos]?.value
    }
    
    const server = getParam("server");
    const commandName = message.commandName;
    // const split = content.split("game:")[1]?.split("command:");
    const game = getParam("game");
    const params = getParam("command");
    if (executeUtilsCommand(commandName, server, message)) return false;
    return {
        message,
        commandName,
        game,
        params
    }
}
const getParam = (param) =>{
    content.split(`${param}:`)[1].trim();
}


const executeUtilsCommand = (command, commandOption, message) => {
    switch (command) {
        case 'java':
            message.deferReply({ephemeral:true})
            const connections = require('../server/connections.json')
            const { OS, ...rest } = connections[commandOption]
            const { Client } = require('ssh2');
            const conn = new Client();
            let cmd = ''
            if (OS === 'win32') {
                cmd = "taskkill.exe /F /IM java.exe";
            } else {
                cmd = "killall java"
            }
            conn.on('ready', () => {
                conn.shell((err, stream) => {
                    if (err) throw err;
                    stream.on('close', () => {
                        
                        message.editReply({content:'Rip java.', ephemeral:true})
                        conn.end();
                    }).on('data', (data) => {
                        //TODO: check for java process
                    });
                    stream.end(`${cmd}\n\exit\n`);
                });
            }).connect({
                port: 22,
                ...rest
            });

            return true;

        default:
            return false;
    }
}

module.exports = {
    executeCommand: executeCommand,
    getCommandByDiscordMessage: getCommandByDiscordMessage,
    executeUtilsCommand
}