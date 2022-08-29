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
    this.onServerRunning = () => {}
    this.onServerStopped = () => {}
    this.players = 0;

    this.onData = (callback) =>{
        this.onDataCallbacks.push(callback);
    }
    this.setup = (config) =>{
        this.config = config;
    }
    
    this.start = async (onServerStarting, onServerRunning) => {
        const {spawn} = require('child_process')
        const {host, username} = connections[this.config.server.remote]
        const startPath = `${this.config.start.path}/run.sh`
        this.server = spawn('ssh', [`${username}@${host}`, startPath],{detached:false})
        this.onServerRunning = onServerRunning;
        this.onServerStarting = onServerStarting;

        if(this.config.server.pipeInput)process.stdin.pipe(this.server.stdin);
        // this.server.stdout.pipe(process.stdout);
        // this.server.stderr.pipe(process.stderr);

        const serverExecution = (data) =>{
            if (this.config.debug) console.log(data)
            if (data.includes(this.config.start.startingMessage)) {
                this.players = 0;
                this.onServerStarting()
            }
            if (data.includes(this.config.start.message)) {
                this.serverRunning = true;
                this.onServerRunning()
            }
            if (this.config.autoShutdown) {
                if (data.includes(this.config.autoShutdown.join)) {
                    this.players++
                }
                if (data.includes(this.config.autoShutdown.left)) {
                    this.players--
                }
            }

            if (data.includes(this.config.stop.message)) {
                if (this.config.stop.notifyDiscord) {
                    this.serverRunning = false;
                    this.onServerStopped()
                }
            }
        }
        this.server.stdout.on('data', async (data) => {
            serverExecution(String(data))
            // console.log(data.toString());
        })
        this.server.stderr.on('data', (data) => {
            console.log('Error: '+data);
        })
        this.server.on('close', (code) => {
            console.log('Process exit code: '+code);
        })
    }

    this.stop = (onServerStopped)=> {
        this.onServerStopped = onServerStopped;
    }

    this.write = (message) =>{
        if (this.server !== null && this.serverRunning) {
            this.server.stdin.write(message + '\r\n');
        }
    }

    
}

module.exports = ServerManager