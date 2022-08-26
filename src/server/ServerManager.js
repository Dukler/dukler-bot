const { Client } = require('ssh2');
const connections = require('./connections.json')

function ServerManager (config = {}) {
    this.conn = new Client();
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
        this.onServerRunning = onServerRunning;
        this.onServerStarting = onServerStarting;

        const serverExecution = (data) =>{
            if (this.config.debug) console.log(String(data))
            if (data.includes(this.config.start.startingMessage)) {
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
        this.conn.on('ready', () => {
            console.log('Client :: ready');
            this.conn.shell((err, stream) => {
                this.server = stream;
                if (err) console.log(err)
                stream.on('close', () => {
                    console.log('Stream :: close');
                    this.conn.end();
                }).on('data', (data) => {
                    serverExecution(data)
                });
                stream.write(`cd ${this.config.start.path}\n ./start.sh\n`)
                // stream.end('ls -l\nexit\n');
            });
        }).connect({
            port: 22,
            ...connections[this.config.server.remote]
        });
    }

    this.stop = (onServerStopped)=> {
        this.onServerStopped = onServerStopped;
    }

    this.write = (message) =>{
        if (this.server !== null && this.serverRunning) {
            this.server.write(message + '\n');
        }
    }

    
}

module.exports = ServerManager