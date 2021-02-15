const port = process.env.PORT || 8000;
const webSocketServer = require('websocket').server;
const http =require("http");
const crypto = require("crypto");
const db = require("./config/mongoose");
const Data = require("./models/data");
const server = http.createServer();

server.listen(port,()=>{
    console.log('Server is listening on port ',port);
});

const wsServer = new webSocketServer({
    httpServer : server
});
let iv = "1234123412341234";
let key = '12345678123456781234567812345678';
var dataObjs = [];
wsServer.on('request',async(request)=>{
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    
    //clearing database on new connection.
    await Data.remove({});
    const connection = request.accept(null, request.origin);
    console.log(' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var tempData = [];
            var dataArray = message.utf8Data.split("|");
            // console.log(dataArray);
            for(let i=0 ;i<dataArray.length;i++){
                let decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
                let decrypted = decipher.update(dataArray[i], 'hex', 'utf-8');
                decrypted += decipher.final('utf-8');
                const data = JSON.parse(decrypted);
                const obj ={
                    name : data.name,
                    origin : data.origin,
                    destination:data.destination
                };

                //checking data integrity...
                const data_key = crypto.createHash("sha256").update(JSON.stringify(obj)).digest('hex');
                if(data_key===data.secret_key){
                    tempData.push(obj);
                }
            }
            dataObjs =[...dataObjs,...tempData];
            //sending dataarray backto client.
            connection.send(JSON.stringify(tempData));
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

//save data on every minute.
setInterval(async()=>{
    if(dataObjs.length!==0){
        const data = new Data;
        data.entry = dataObjs;
        await data.save();
        dataObjs=[];
    }
},60000);