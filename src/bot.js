const { getGameServer } = require('./server');
const commandSymbol = '!'
// const utilCommands = Object.freeze({
//     'java':'',
//     Tuesday: 1,
//     Wednesday: 2,
//     Thursday: 3,
//     Friday: 4,
//     Saturday: 5,
//     Sunday: 6
// })


async function executeCommand (command) {
    if (command){
        const {order, game, params, message} = command;
        let server;
        try {
            server = await getGameServer(command)
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
    const order = words[0].slice(1);
    params.splice(0,2);
    if (executeUtilsCommand(order, message.channel)) return false;
    if (words[0].charAt(0) == commandSymbol && words.length >= 2){
        return {
            message,
            order,
            game: words[1],
            params
        }
    }else{
        console.error("Invalid command");
    }
}



const executeUtilsCommand=(command, channel)=>{
    switch (command) {
        case 'java':
            const {platform} = require('os');
            os= platform()
            const {execSync} = require('child_process');
            let cmd = ''
            if(os === 'win32'){
                cmd = "taskkill.exe /F /IM java.exe";
            }else{
                cmd = "killall java"
            }
            try {
                const bat = execSync(cmd)
                channel.send('Rip java.')
            } catch (error) {
                channel.send('Bro, java esta cerrado.')
            }
            
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