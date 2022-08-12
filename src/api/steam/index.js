const fetch = require('node-fetch');

function getModIdByWorkshopId(workshopId, callback){
    fetch(
        `https://steamcommunity.com/sharedfiles/filedetails/?id=${workshopId}`,{
            headers:{
                Server:'nginx',
                Connection:'keep-alive'
            }
        }
    )
    .then(response=>{
        return response.text();
    })
    .then(data=>{
        callback(parseModIdFromResponse(data));
    })
}

const parseModIdFromResponse = (data) =>{
    const modIndex = data.toLowerCase().indexOf('mod id:');
    const firstHalf = data.substring(modIndex);
    const secondModIndex = firstHalf.indexOf('<');
    const secondHalf = firstHalf.substring(0,secondModIndex);
    let modId = secondHalf.substring(secondHalf.toLowerCase().indexOf('id:')+3);
    modId = modId.trimStart();
    return modId;
}

module.exports = {
    getModIdByWorkshopId
}