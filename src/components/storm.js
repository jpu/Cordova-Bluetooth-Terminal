 export default class Storm {

    constructor(serialWrite) {
        this.pitch = 1500;
        this.pitchstep = 30;
        this.lastpitch = 0;
        this.yaw = 1500;
        this.lastyaw = 0;
        this.yawstep = 30;
        this.standby = 0;
        this.serialWrite;
    
    };
    showError = function () {
        console.error(error);
    };
    up = function(){
        this.pitch = Math.max(this.pitch - this.pitchstep, 700);
        this.actuate();
    };
    down = function(){
        this.pitch = Math.min(this.pitch + this.pitchstep, 2300);
        this.actuate();
    };
    left = function(){
        this.yaw = Math.min(this.yaw + this.yawstep, 2300);
        this.actuate();
    };
    right = function(){
        this.yaw = Math.max(this.yaw - this.yawstep, 700);
        this.actuate();
    };
    center = function(){        
        this.pitch = 1500
        this.yaw = 1500
        this.actuate();
    };
    toggleStandby = function(){
        this.standby = !this.standby;
        this.setStandby(this.standby)
    };
    actuate = function(){
        console.log("actuate, pitch: " + this.pitch +" , yaw: " + this.yaw);
        if (this.pitch != this.lastpitch || this.yaw != this.lastyaw){
            this.setPitchRollYaw(this.pitch, 1500, this.yaw)
            this.lastpitch = this.pitch
            this.lastyaw = this.yaw
        }    
    };
    getVersion = function(){
        var payload = null;
        this.sendMessage(0x00, payload);  
    };
    setPitchRollYaw = function(pitch, roll, yaw){
        var payload = this.Uint16ToUint8Pair(pitch).concat(this.Uint16ToUint8Pair(roll)).concat(this.Uint16ToUint8Pair(yaw));
        this.sendMessage(0x12, payload);
    };        
    
    //Format and send the message
    sendMessage = function(commandId, payload){
        // Add message header indicating outgoing message
        var message = [0xFA];
        if (payload){
        // Add payload length
        message.push(payload.length);
        } else {
        // Or zero, if there's no payload
        message.push(0);
        }
        // Add command id
        message.push(commandId);
        if (payload){
        // Add payload
        message = message.concat(payload);
        } 
        // Add crc
        message = message.concat(this.getCrc(commandId, payload))
        // Write the message to serial
        bluetoothSerial.write(message, null, this.showError);
    };

    setStandby = function(state){
        var payload = [state]
        this.sendMessage(0x0E, payload);
    };

    toHexString = function(byteArray) {
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }

    // Data formatting helper
    Uint16ToUint8Pair(val){
        var bytes = [
        val & 0xff,
        val >> 8 & 0xff,
        ];
        return bytes;
    };
  
    // CRC (x.25) helper
    getCrc(commandId, payload) {
        var bytes = [commandId];
        if (payload){
        bytes = bytes.concat(payload);
        }
        var crc = crc || 0xffff;
        bytes.forEach(e => {
            var tmp = e ^ (crc & 0xff);
            tmp = (tmp ^ (tmp << 4)) & 0xff;
            crc = (crc >> 8) ^ (tmp << 8) ^ (tmp << 3) ^ (tmp >> 4);
            crc = crc & 0xffff;
        });
        return this.Uint16ToUint8Pair(crc);
    };
};