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
                console.log(`${interaction.user.username} executed ${commandName}`)
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
    const connections = require('../server/connections.json')
    if(!commandOption) return
    const { OS, host, username } = connections[commandOption]
    console.log('asd');
    switch (command) {
        case 'java':
            interaction.deferReply({ephemeral:true})
            const cmd = OS === 'win32' ? "taskkill.exe /F /IM java.exe" : "killall java";
            runRemote({run:cmd, username, host, onExit:()=>interaction.editReply({content:'Rip java.', ephemeral:true})})

            return true;
        case 'ping':
            const path = __dirname + '/../utils/ping.sh'
            // runRemote({run:'/home/comanchero-s0/Documents/ping.sh', commandOption, username, host})
            // const asd = require('../utils/ping.sh')
            runLocal({run:[path,String(host)]})
            
            return true
        default:
            return false;
    }
}


const runLocal = ({run, onExit = ()=>console.log('exit'), onData = (data)=>console.log(data.toString())}) =>{
    try {
        const spawn = require('child_process').spawn;
        
        const proc = spawn('sh', run,{detached:false,shell:true})

        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        // proc.stdin.write('ping google.com -D' + '\r\n')
        
        proc.stdout.on('data', async (bytes) => {
            const data = bytes.toString()
            onData(data);
        });
        proc.on('exit', ()=>{
            onExit()
        })
    } catch (error) {
        console.log(error)
    }
}

const runRemote = ({run, username, host, onExit = ()=>console.log('exit')}) =>{
    try {
        const spawn = require('child_process').spawn;
        
        const proc = spawn('ssh', [`${username}@${host}`, run],{detached:false,shell:true})

        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        // proc.stdin.write('ping google.com -D' + '\r\n')
        
        proc.stdout.on('data', async (bytes) => {
            const data = bytes.toString()
            console.log(data.toString())
        });
        proc.on('exit', ()=>{
            onExit()
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    executeCommand: executeCommand,
    getCommandByDiscordMessage: getCommandByDiscordMessage,
    executeUtilsCommand
}