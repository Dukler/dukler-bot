function ServerManager () {
    this.server = null;
    this.onDataCallbacks=[];
    this.serverRunning=false;
    this.channel= null;
    this.config = null;

    this.onData = (callback) =>{
        this.onDataCallbacks.push(callback);
    }
    this.setup = (config, channel) =>{
        this.config = config;
        this.channel = channel;
    }
    this.start = () => {
        const {spawn} = require('child_process'),
        {platform} = require('os'),
        osType = platform();
        const initPath = this.config.start.path.substr(0, this.config.start.path.lastIndexOf("\\"))
        let command = this.config.start.path,
            args = [],
            options = {detached: false, cwd:initPath};

        if (osType == 'win32') {
            options.shell = true;
            command = "\""+command+"\"";
        }

        this.server = spawn(command,args,options);

        this.server.stdout.pipe(process.stdout);
        this.server.stderr.pipe(process.stderr);
        // process.stdin.pipe(this.server.stdin);

        this.server.stdout.on('data', (data) => {
            if(data.includes(this.config.start.message)){
                this.serverRunning=true;
                if(this.config.start.notifyDiscord){
                    this.channel.send(`${this.config.server.name} server has started!`);
                }
            }
            if(data.includes(this.config.stop.message)){
                if(this.config.stop.notifyDiscord){
                    this.channel.send(`${this.config.server.name} server has stopped!`);
                    this.serverRunning=false;
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