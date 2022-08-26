const { getGameServer } = require('../server');


async function executeCommand(command) {
    if (command) {
        const { commandName, interaction } = command;
        // let props = {game, params};
        // if ( typeof params === 'object' && params !== null ) props = {game, ...params}
        let server;
        try {
            server = await getGameServer(command)
        } catch (error) {
            return console.error("Game doesn't exists.")
        }
        if (server[commandName] != null) {
            try {
                await interaction.deferReply({ephemeral:true})
                server[commandName](command);
            } catch (error) {
                return console.error(error)
            }
        } else {
            console.error("Command doesn't exists.")
        }
    }
}



const getCommandByDiscordMessage = (interaction) => {
    
    const getParam = (param) =>{
        const dataArr = interaction.options.data;
        // return content.split(`${param}:`)[1]?.trim();
        const pos = dataArr.findIndex(i => i.name === param);
        return interaction.options.data[pos]?.value
    }
    
    const server = getParam("server");
    const commandName = interaction.commandName;
    // const split = content.split("game:")[1]?.split("command:");
    const game = getParam("game");
    const commandString = getParam("command");
    if (executeUtilsCommand(commandName, server, interaction)) return false;
    return {
        interaction,
        commandName,
        game,
        commandString
    }
}


const executeUtilsCommand = (command, commandOption, interaction) => {
    switch (command) {
        case 'java':
            interaction.deferReply({ephemeral:true})
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
                        
                        interaction.editReply({content:'Rip java.', ephemeral:true})
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