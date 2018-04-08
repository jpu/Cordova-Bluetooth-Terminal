var express = require('express');
const WebSocket = require('ws');
const path = require('path');

console.log('[livestream]', 'started');

var STREAM_PORT =           8082;
var WEBSOCKET_PORT =        8084;
var STREAM_MAGIC_BYTES =    'jsmp';
var width =                 432;
var height =                240;

var socketServer = new WebSocket.Server({port: WEBSOCKET_PORT});
socketServer.on('connection', function(socket) {
    // var streamHeader = new Buffer(8);
    // streamHeader.write(STREAM_MAGIC_BYTES);
    // streamHeader.writeUInt16BE(width, 4);
    // streamHeader.writeUInt16BE(height, 6);
    // socket.send(streamHeader, {binary:true});
    console.log( 'New WebSocket Connection ('+socketServer.clients.length+' total)' );
    console.log(this.clients);
    socket.on('close', function(code, message){
        console.log( 'Disconnected WebSocket ('+socketServer.clients.length+' total)' );
    });
});

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