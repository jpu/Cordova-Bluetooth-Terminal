export default class UdpSocket {
    constructor(url, options) {
        this.streaming = true;
        this.url = url;
        this.port = url.split(':').slice(-1)[0].split('/')[0];
        this.options = options;
        this.socket = null;
        this.callbacks = {
            connect: [],
            data: []
        };
        this.destination = null;
        this.reconnectInterval = options.reconnectInterval !== undefined ? options.reconnectInterval : 5;
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.completed = false;
        this.established = false;
        this.progress = 0;
        this.reconnectTimeoutId = 0;
    };
    connect = function(destination) {
        console.log("UdpSocket: connect(destination): destination = " + destination);
        this.destination = destination;        
    };
    destroy = function() {
        console.log("UdpSocket: destroy()");
        clearTimeout(this.reconnectTimeoutId);
        this.shouldAttemptReconnect = false;
        this.socket.close();
    };
    start = function() {
        console.log("UdpSocket: start()");
        this.shouldAttemptReconnect = !!this.reconnectInterval;
        this.progress = 0;
        this.established = false;
        this.socket = dgram.createSocket('multicast-udp4', this.port)
        this.socket.on('message', this.onMessage.bind(this))
        this.socket.bind(this.onOpen.bind(this), this.onClose.bind(this));
    };
    resume = function(secondsHeadroom) {};
    onOpen = function() {
        console.log("UdpSocket: onOpen()");
        this.progress = 1;
        this.established = true;
    };
    onClose = function() {
        console.log("UdpSocket: onClose()");
        if (this.shouldAttemptReconnect) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = setTimeout(function() {
                this.start();
            }.bind(this), this.reconnectInterval * 1e3);
        }
    };
    onMessage = function(msg) {
        if (this.destination) {
            this.destination.write(_base64ToArrayBuffer(msg));
        }
    };
};

function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}