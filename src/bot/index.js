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


const executeUtilsCommand = async (command, commandOption, interaction) => {
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
            await interaction.deferReply({ephemeral:true})
            // const path = __dirname + '/../utils/ping.sh'
            // interaction.deferReply({ephemeral:true})
            // const onExit = (code) =>{
            //     if (code === 1) interaction.editReply({content:'Servidor muerto.', ephemeral:true})
            // }
            // runLocal({run:[path,String(host)], onExit})
            utilCommands.isAlive(host)
                .then(()=>{
                    interaction.editReply({content:'Vivo', ephemeral:true})
                })
                .catch(()=>{
                    interaction.editReply({content:'Muerto', ephemeral:true})
                })
            
            return true
        default:
            return false;
    }
}
const utilCommands = {
    runRemote: (OS, username, host, interaction) => {
        const cmd = OS === 'win32' ? "taskkill.exe /F /IM java.exe" : "killall java";
        runRemote({run:cmd, username, host, onExit: ()=>interaction.editReply({content:'Rip java.', ephemeral:true})})
    },
    isAlive: (host)=> new Promise((resolve,reject) =>{
        const path = __dirname + '/../utils/ping.sh'
        const onExit = (code) =>{
            console.log(code)
            if (code === 0) resolve (true)
            reject(false)
        }
        runLocal({run:[path,String(host)], onExit})
    })
}


const runLocal = ({run, onExit = (code)=>console.log(`exit ${code}`), onData = (data)=>console.log(data.toString())}) =>{
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
        proc.on('exit', (code)=>{
            onExit(code)
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
    executeUtilsCommand,
    utilCommands
}