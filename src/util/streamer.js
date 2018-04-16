var express = require('express');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

console.log('[livestream]', 'started');

var STREAM_PORT =           8082;
var WEBSOCKET_PORT =        8084;
var width =                 432;
var height =                240;

var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT});
socketServer.on('connection', function(socket) {
    console.log( 'New WebSocket Connection ('+socketServer.clients.length+' total)' );
    console.log(this.clients);
    socket.on('close', function(code, message){
        console.log( 'Disconnected WebSocket ('+socketServer.clients.length+' total)' );
    });
    socket.on('message', function(message){

        if (sendUdpInterval){
            clearInterval(sendUdpInterval);
        }
        //console.log("Setting up sendUdpInterval")
        udpSendIndex = 0;
        sendUdpInterval = setInterval(sendNextUdpPacket,1);
    })
});

var sendUdpInterval = null;
var udpSendIndex = 0;
var udps = [];

fs.readFile('./util/ts2.ts',function(err,data){
    udps = [];
    if(err){console.log(err); return;}
    console.log("Sending file...")
    for (var i=0; i<data.byteLength; i+=1328){
        console.log(i)
        udps.push(data.slice(i, i+1328));
    }
    console.log("Slices up!")
});

function sendNextUdpPacket() {
    //console.log("Sending udp packet " + udpSendIndex)
    if (udpSendIndex == 400){
        console.log("at 1000");
    } else if (udpSendIndex == 1400){
        console.log("at 2000");
    } 

    if (udpSendIndex < udps.length-1){
        socketServer.broadcast(udps[udpSendIndex], {binary:true});
        udpSendIndex++;
    }
}

socketServer.broadcast = function(data, opts) {
    this.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data, opts);
        } else {
            console.log( 'Error: Client not connected.' );
        }
    });
};

var app = express();
app.post('/publish', function (req, res) {
    console.log(
        'Stream Connected: ' + req.socket.remoteAddress +
        ':' + req.socket.remotePort + ' size: ' + width + 'x' + height
    );
    req.socket.setTimeout(0);
    req.on('data', function(data){
        socketServer.broadcast(data, {binary:true});
    });
});
app.listen(STREAM_PORT);