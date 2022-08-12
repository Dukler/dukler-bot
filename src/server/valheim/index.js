const config = require('./config.json');
const SM = require('../manager/ServerManager');
const serverManager = new SM();

const valheim = {
    start:(params, channel)=>{
        channel.send('Server starting... ');
        // const batPath = config.start.fullPath.replace(/ /g,"\\\ ");
        // this.serverManager = this.serverManager == null ? new ServerManager(config, channel): this.serverManager;
        serverManager.setup(config,channel);
        serverManager.start();
    },
    stop:(params,channel)=>{
        // this.serverManager.updateChannel(channel);
        serverManager.write('cmd /c exit -1073741510');
        // this.serverManager.kill('SIGINT');
    },
    restart:(params,channel)=>{
        
    },
}


module.exports = valheim