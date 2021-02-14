const port = process.env.PORT || 8000;
const webSocketServer = require('websocket').server;
const http =require("http");

const server = http.createServer();

server.listen(port,()=>{
    console.log('Server is listening on port ',port);
});

const wsServer = new webSocketServer({
    httpServer : server
});

wsServer.on('request',(request)=>{
    console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
    console.log("mongoooooooooooooooooooo");
    const connection = request.accept(null, request.origin);
    console.log(' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            const data = JSON.parse(message.utf8Data);
            console.log('Received Message: ' + data.message);
            var uData = data.message.toUpperCase();
            connection.send(JSON.stringify({
                message : uData
            }));
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
