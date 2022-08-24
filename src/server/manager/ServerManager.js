function ServerManager (config = {}) {
    this.server = null;
    this.onDataCallbacks=[];
    this.serverRunning=false;
    this.channel= null;
    this.config = config;
    this.onServerRunning = () => {}
    this.onServerStopped = () => {}
    this.players = 0;

    const {platform} = require('os');
    this.serverOS = platform();

    this.onData = (callback) =>{
        this.onDataCallbacks.push(callback);
    }
    this.setup = (config) =>{
        this.config = config;
    }
    
    this.start = async (onServerRunning, onServerStopped) => {
        const {spawn} = require('child_process')
        
        const initPath = this.config.start.path.substr(0, this.config.start.path.lastIndexOf("\\"))
        this.onServerRunning = onServerRunning;
        this.onServerStopped = onServerStopped;
        let command = this.config.start.path,
            args = [],
            options = {detached: false, cwd:initPath};

        if (this.serverOS == 'win32') {
            options.shell = true;
            command = "\""+command+"\"";
        }

        this.server = spawn(command,args,options);

        this.server.stdout.pipe(process.stdout);
        this.server.stderr.pipe(process.stderr);
        
        //process.stdin.pipe(this.server.stdin);

        this.server.stdout.on('data', async (data) => {
            if(this.config.debug) console.log(String(data))
            if(data.includes(this.config.start.message)){
                this.serverRunning=true;
                this.onServerRunning()
            }
            if(this.config.autoShutdown){
                if(data.includes(this.config.autoShutdown.join)){
                    this.players ++
                }
                if(data.includes(this.config.autoShutdown.left)){
                    this.players --
                }
            }
            
            if(data.includes(this.config.stop.message)){
                if(this.config.stop.notifyDiscord){
                    this.serverRunning=false;
                    this.onServerStopped()
                }
            }
            this.onDataCallbacks.forEach((cb)=>{
                cb(data);
            })
            // console.log(data.toString());
        })
        this.server.stderr.on('data', (data) => {
            console.log('Error: '+data);
        })
        this.server.on('close', (code) => {
            console.log('Process exit code: '+code);
        })
    }

    this.write = (message) =>{
        if (this.server !== null && this.serverRunning) {
            this.server.stdin.write(message + '\r\n');
        }
    }

    
}

module.exports = ServerManager