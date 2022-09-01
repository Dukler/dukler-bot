const { getGameServer } = require('../server');
const { isAlive, runRemote } = require('../server/utils');


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
                console.log(`${interaction.user.username} executed ${commandName}`)
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
    const connections = require('../server/connections.json')
    if(!commandOption) return false
    const { OS, host, username } = connections[commandOption]
    switch (command) {
        case 'java':
            const cmd = OS === 'win32' ? "taskkill.exe /F /IM java.exe" : "killall -9 java";
            runRemote({run:[cmd], username, host, onExit:()=>interaction.editReply({content:'Rip java.', ephemeral:true})})
            return true;
        case 'ping':
            isAlive(host)
                .then((isAlive)=>{
                    if(isAlive)interaction.editReply({content:'Vivo', ephemeral:true})
                    interaction.editReply({content:'Muerto', ephemeral:true})
                })
                .catch((err)=>{
                    console.log(err)
                })
            
            return true
        default:
            return false;
    }
}





module.exports = {
    executeCommand: executeCommand,
    getCommandByDiscordMessage: getCommandByDiscordMessage,
    executeUtilsCommand
}