let serverProcess = null;
let serverRunning = false;
let onlineNotice = false;
let lastWorld = null;
let currentWorld = null;
let players = 0;
let checkingPlayers;
let consoleOutput = null;
const stopTimer = 5;
const fs = require('fs')

function jsonReader(filePath, cb) {
    fs.readFile(filePath, (err, fileData) => {
        if (err) {
            return cb && cb(err)
        }
        try {
            const object = JSON.parse(fileData)
            return cb && cb(null, object)
        } catch (err) {
            return cb && cb(err)
        }
    })
}

function readWorldKillers() {
    jsonReader('./World killers.json', (err, worldKiller) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(worldKiller.kills) // => "Infinity Loop Drive"
    })
}

//lean 1, yo 1, funes 2, jero 1;
function updateKillers(worldKiller) {
    const file = './World killers.json'
    jsonReader(file, (err, worldKillerArr) => {
        if (err) {
            console.log(err)
            return
        }
        worldKillerArr.forEach(wk => {
            if (wk.name === worldKiller) {
                wk.kills++;
                worldKillerArr.push(wk);
            } else {
                const wkaux = { name: worldKiller, kills: 0 }
                worldKillerArr.push(wkaux);
            }

        });
        fs.writeFile(file, JSON.stringify(worldKillerArr), (err) => {
            if (err) console.log('Error writing file:', err)
        })
    })
}

async function deleteWorld(message, name) {
    if (!serverRunning) {
        let rimraf = require("rimraf");
        rimraf.sync("./" + name + "/world/*");
        console.log("/" + name + "/world");
        console.log("world:", name + " deleted.");
        start(message, name);
        // start(message);
    } else {
        setTimeout(() => { deleteWorld(message, name) }, 1000);
    }
}

const write = (c) => {
    if (serverProcess !== null && serverRunning) {
        serverProcess.stdin.write('/' + c + '\r\n');
    }
}

const stop = (message) => {
    if (serverRunning) {
        write('stop');
        clearTimeout(checkingPlayers);
        onlineNotice = false;
        (async function awaitStop() {
            setTimeout(awaitStop, 1000);
        })();
    } else {
        if (serverProcess) {
            currentWorld = null;
            serverProcess.kill();
        }
    }
}
const restart = (message) => {
    stop(message);
    (async function awaitStop() {
        if (serverRunning) {
            setTimeout(awaitStop, 1000);
        } else {
            start(message)
        }
    })();
}

const searchConsole = (search, callback) => {
    if (consoleOutput.toString().includes(search)) {
        callback();
    }
}


const start = (worldServer, channel) => {
    if (!serverRunning) {
        channel.send('server starting... ');
        const world = worldServer ? worldServer : lastWorld ? lastWorld : 'hard';
        lastWorld = world;
        currentWorld = world;
        serverStopped = false;
        serverProcess = require('child_process').execFile(
            'java', [
            '-XX:+UseG1GC', '-Xmx4G', '-Xms4G', '-Dsun.rmi.dgc.server.gcInterval=2147483646', '-XX:+UnlockExperimentalVMOptions', '-XX:G1NewSizePercent=20', '-XX:G1ReservePercent=20', '-XX:MaxGCPauseMillis=50', '-XX:G1HeapRegionSize=32M', '-jar', 'server.jar', 'nogui'
        ], { cwd: './' + world },
            (error, stdout, stderr) => {
                console.log(error);
                console.log(stdout);
                console.log(stderr);
            });

        serverProcess.stdout.on('data', function (data) {
            console.log(data.toString());
            consoleOutput = data;
            searchConsole('Done (', () => {
                serverRunning = true;
                autoShutdown();
                if (!onlineNotice) {
                    message.channel.send('server online');
                    onlineNotice = true;
                }
            })
            searchConsole('joined the game', () => {
                players++;
            });
            searchConsole('left the game', () => {
                players--;
            });
        });
        serverProcess.stderr.on("data", function (data) {
            consoleOutput = data;
            console.log(data.toString());
        });
        serverProcess.on('close', () => {
            message.channel.send('server stopped');
            serverRunning = false;
        });
    } else {
        message.channel.send('server already online, world: ' + currentWorld.toString());
    }
}

async function autoShutdown() {
    let counter = 0;
    (async function checkPlayers() {
        if (serverRunning) {
            if (counter < stopTimer) {
                if (players > 0) {
                    counter = 0;
                } else {
                    console.log('El server se cierra en:', stopTimer - counter + ' minutos \n\r');
                    counter++;
                }
                checkingPlayers = setTimeout(checkPlayers, 60000);
            } else {
                stop();
            }
        }
    })();
}
