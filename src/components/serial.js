export default class {

    constructor() {
        this.pitch = 1500;
        this.pitchstep = 30;
        this.lastpitch = 0;
        this.yaw = 1500;
        this.lastyaw = 0;
        this.yawstep = 30;
        this.standby = 0;
    };

    showError () {
        console.error(error);
    };
    up(){
        this.pitch = Math.max(this.pitch - this.pitchstep, 700);
        this.actuate();
    };
    down(){
        this.pitch = Math.min(this.pitch + this.pitchstep, 2300);
        this.actuate();
    };
    left(){
        this.yaw = Math.min(this.yaw + this.yawstep, 2300);
        this.actuate();
    };
    right(){
        this.yaw = Math.max(this.yaw - this.yawstep, 700);
        this.actuate();
    };
    center(){        
        this.pitch = 1500
        this.yaw = 1500
        this.actuate();
    };
    toggleStandby(){
        this.standby = !this.standby;
        this.setStandby(this.standby)
    };
    actuate(){
        console.log("actuate, pitch: " + this.pitch +" , yaw: " + this.yaw);
        if (this.pitch != this.lastpitch || this.yaw != this.lastyaw){
            this.setPitchRollYaw(this.pitch, 1500, this.yaw)
            this.lastpitch = this.pitch
            this.lastyaw = this.yaw
        }    
    };
    getVersion(){
        var payload = null;
        this.sendMessage(0x00, payload);  
    };
    setPitchRollYaw(pitch, roll, yaw){
        var payload = this.Uint16ToUint8Pair(pitch).concat(this.Uint16ToUint8Pair(roll)).concat(this.Uint16ToUint8Pair(yaw));
        this.sendMessage(0x12, payload);
    };        
    setStandby(state){
        var payload = [state]
        this.sendMessage(0x0E, payload);
    };
    // Format and send the message
    sendMessage(commandId, payload){
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
        message = message.concat(getCrc(commandId, payload))
        // Write the message to serial
        serialWrite(message);
    };
};