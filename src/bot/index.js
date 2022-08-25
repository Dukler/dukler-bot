const { getGameServer } = require('../server');


async function executeCommand(command) {
    if (command) {
        const { commandName, game, params, message } = command;
        let server; 73197319
        try {
            server = await getGameServer(command)
        } catch (error) {
            return console.error("Game doesn't exists.")
        }
        if (server[commandName] != null) {
            try {
                server[commandName](params, message);
            } catch (error) {
                return console.error(error)
            }
        } else {
            console.error("Command doesn't exists.")
        }
    }
}



const getCommandByDiscordMessage = (message) => {
    const content = message.toString();
    const words = content.split(" ");
    // const params = [...words];
    const params = '';
    const commandName = message.commandName;
    const commandOption = content.split(":")[1];
    if (executeUtilsCommand(commandName, commandOption, message)) return false;
    return {
        message,
        commandName,
        game: commandOption,
        params
    }
}



const executeUtilsCommand = (command, commandOption, message) => {
    switch (command) {
        case 'java':
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
                        message.reply({content:'Rip java.', ephemeral:true})
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