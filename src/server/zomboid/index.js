const steamApi = require('../../api/steam/index')
const fs = require('fs');
const config = require('./config.json');
const SM = require('../manager/ServerManager');
const serverManager = new SM();

const zomboid = {
    start:(params, channel)=>{
        channel.send('Server starting... ');
        // const batPath = config.start.fullPath.replace(/ /g,"\\\ ");
        serverManager.setup(config, channel);
        serverManager.start();
    },
    stop:(params,channel)=>{
        serverManager.updateChannel(channel);
        serverManager.write("quit");
    },
    restart:(params,channel)=>{
        
    },
    addmod:(params, channel) =>{
        const workshopId = params[0];
        try{
            steamApi.getModIdByWorkshopId(workshopId,(modId)=>{
                const file = getServerConfigFile();
                saveFileAddMod(file,modId,workshopId);
                channel.send("Mod added succefully.");
            })
        }catch(err){
            channel.send("Eror adding the mod");
        }
        
    },
    delmod:(params,channel)=>{
        const workshopId = params[0];
        try{
            steamApi.getModIdByWorkshopId(workshopId,(modId)=>{
                const file = getServerConfigFile();
                saveFileDelMod(file,modId,workshopId);
            })
        }catch(err){
            channel.send("Eror deleting the mod");
        }
    }
}

const getListsForFile = (file)=>{
    const auxMods = file.content.substring(file.content.indexOf("Mods="));
    const modList = auxMods.substring(0,auxMods.indexOf('\r\n'));
    const auxWorkshop = file.content.substring(file.content.indexOf("WorkshopItems="));
    const workshopList = auxWorkshop.substring(0,auxWorkshop.indexOf('\r\n'));
    const workshopArr = workshopList.split(';');
    workshopArr[0] = workshopArr[0].substring(workshopArr[0].indexOf("=")+1);

    return {modList, workshopList, workshopArr}
}

const saveFileDelMod = (file, modId, workshopId) =>{
    const {modList,workshopList, workshopArr} = getListsForFile(file);
    if (workshopArr.includes(workshopId) && modId != null && workshopId != null){
        let newFileContent = file.content.replace(`;${workshopId}`,"");
        newFileContent = newFileContent.replace(`;${modId}`,"");
        fs.writeFileSync(file.path,newFileContent);
    }else{
        throw new Error("Error uninstalling the mod.")
    }
}

const saveFileAddMod = (file, modId, workshopId) =>{
    const {modList,workshopList, workshopArr} = getListsForFile(file);
    if (!workshopArr.includes(workshopId) && modId != null && workshopId != null){
        const newModList = `${modList};${modId}`
        const newWorshopList = `${workshopList};${workshopId}`
        const newContent = file.content.replace(modList,newModList);
        fs.writeFileSync(file.path,newContent.replace(workshopList,newWorshopList));
    }else{
        throw new Error("Error installing the mod.")
    }
    
}

const getServerConfigFile = () => {
    const home = process.env.HOMEPATH;
    const path = `C:\\${home}\\Zomboid\\Server\\servertest.ini`
    return {content: fs.readFileSync(path,'utf8'), path}
}

module.exports = zomboid