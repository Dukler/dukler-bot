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
        const {spawn} = require('child_process')
        
        const initPath = this.config.start.path.substr(0, this.config.start.path.lastIndexOf("\\"))
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
                if (err) throw err;
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

        // let command = this.config.start.path,
        //     args = [],
        //     options = {detached: false, cwd:initPath};

        // if (this.config.server.os == 'win32') {
        //     options.shell = true;
        //     command = "\""+command+"\"";
        // }

        // this.server = spawn(command,args,options);

        // this.server.stdout.pipe(process.stdout);
        // this.server.stderr.pipe(process.stderr);
        

        // this.server.stdout.on('data', async (data) => {
        //     if(this.config.debug) console.log(String(data))
        //     if(data.includes(this.config.start.message)){
        //         this.serverRunning=true;
        //         this.onServerRunning()
        //     }
        //     if(this.config.autoShutdown){
        //         if(data.includes(this.config.autoShutdown.join)){
        //             this.players ++
        //         }
        //         if(data.includes(this.config.autoShutdown.left)){
        //             this.players --
        //         }
        //     }
            
        //     if(data.includes(this.config.stop.message)){
        //         if(this.config.stop.notifyDiscord){
        //             this.serverRunning=false;
        //             this.onServerStopped()
        //         }
        //     }
        //     this.onDataCallbacks.forEach((cb)=>{
        //         cb(data);
        //     })
        // })
        // this.server.stderr.on('data', (data) => {
        //     console.log('Error: '+data);
        // })
        // this.server.on('close', (code) => {
        //     console.log('Process exit code: '+code);
        // })
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