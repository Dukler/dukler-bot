// const { Client } = require('ssh2');
const connections = require('./connections.json')

function ServerManager (config = {}) {
    // this.conn = new Client();
    this.server = null;
    this.onDataCallbacks=[];
    this.serverRunning=false;
    this.channel= null;
    this.config = config;
    this.onServerStarting = () => {}
    this.onServerStarted = () => {}
    this.onServerStopped = () => {}
    this.players = 0;

    this.onData = (callback) =>{
        this.onDataCallbacks.push(callback);
    }
    this.setup = (config) =>{
        this.config = config;
    }
    
    this.start = async () => {
        const {spawn} = require('child_process')
        const {host, username} = connections[this.config.server.remote]
        const startPath = `${this.config.start.path}/run.sh`
        this.server = spawn('ssh', [`${username}@${host}`, startPath],{detached:false})

        if(this.config.server.pipe.input)process.stdin.pipe(this.server.stdin);
        if(this.config.server.pipe.output){
            this.server.stdout.pipe(process.stdout);
            this.server.stderr.pipe(process.stderr);
        }
        const logPlayers = () =>{
            console.log(`${this.players} players are currently online.`)
        }

        const serverExecution = (data) =>{
            // if (this.config.debug) console.log(data)
            if (data.includes(this.config.start.startingMessage)) {
                this.onServerStarting()
            }
            if (data.includes(this.config.start.message)) {
                this.serverRunning = true;
                this.onServerStarted()
            }
            if (this.config.autoShutdown) {
                if (data.includes(this.config.autoShutdown.join)) {
                    this.players++
                    logPlayers()
                }
                if (data.includes(this.config.autoShutdown.left)) {
                    this.players--
                    logPlayers()
                }
            }

            // if (data.includes(this.config.stop.message)) {
            //     if (this.config.stop.notifyDiscord) {
            //         this.serverRunning = false;
            //         this.onServerStopped()
            //     }
            // }
        }
        this.server.stdout.on('data', async (data) => {
            serverExecution(String(data))
            // console.log(data.toString());
        })
        // this.server.stderr.on('data', (data) => {
        //     console.log('Error: '+data);
        // })
        this.server.on('close', (code) => {
            this.onServerStopped(code)
            this.players = 0;
            this.serverRunning = false;
            console.log('Process exit code: '+code);
        })
    }

    this.write = (message) =>{
        if (this.server !== null && this.serverRunning) {
            this.server.stdin.write(message + '\r\n');
        }
    }

    this.stop = ()=> {
        this.write(this.config.stop.cmd)
    }

    
}

module.exports = ServerManager