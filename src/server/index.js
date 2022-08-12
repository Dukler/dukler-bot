async function executeCommand (command) {
    if (command){
        const {order, game, params, message} = command;
        let server;
        try {
            server = await (await import (`./${game}/index.js`)).default
        }catch(error){
            return console.error("Game doesn't exists.")
        }
        if (server[order] != null){
            server[order](params, message.channel);
        }else{
            console.error("Command doesn't exists.")
        }
    }
}


const getCommandByDiscordMessage = (message) => {
    const {content} = message;
    const words = content.split(" ");
    const params = [...words];
    params.splice(0,2);
    if (words[0].charAt(0) == commandSymbol && words.length >= 2){
        return {
            message,
            order: words[0].slice(1),
            game: words[1],
            params
        }
    }else{
        console.error("Invalid command");
    }
}
const commandSymbol = '!'


module.exports = {
    executeCommand: executeCommand,
    getCommandByDiscordMessage: getCommandByDiscordMessage,
}