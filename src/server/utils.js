const isAlive = (host)=> new Promise((resolve,reject) =>{
    const path = __dirname + '/../utils/ping.sh'
    const onExit = (code) =>{
        console.log(code)
        if (code === 0) resolve (true)
        reject(false)
    }
    runLocal({run:[path,String(host)], onExit})
})

const runLocal = ({run = [], onExit = (code)=>console.log(`exit ${code}`), onData = (data)=>console.log(data.toString())}) =>{
    try {
        const spawn = require('child_process').spawn;
        
        const proc = spawn('sh', run,{detached:false,shell:true})

        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        // proc.stdin.write('ping google.com -D' + '\r\n')
        
        proc.stdout.on('data', async (bytes) => {
            const data = bytes.toString()
            onData(data);
        });
        proc.on('exit', (code)=>{
            onExit(code)
        })
    } catch (error) {
        console.log(error)
    }
}

const runRemote = ({run = [], username, host, onExit = ()=>console.log('exit')}) =>{
    try {
        const spawn = require('child_process').spawn;
        
        const proc = spawn('ssh', [`${username}@${host}`, ...run],{detached:false,shell:true})

        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        // proc.stdin.write('ping google.com -D' + '\r\n')
        
        proc.stdout.on('data', async (bytes) => {
            const data = bytes.toString()
            console.log(data.toString())
        });
        proc.on('exit', ()=>{
            onExit()
        })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    isAlive,
    runLocal,
    runRemote
}