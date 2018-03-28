(function( window ){

    var storm = {
        pitchstep: 30,
        pitch: 1500,
        lastpitch: 0,
        yaw: 1500,
        lastyaw: 0,
        yawstep: 30,
        standby: 0,

        initialize: function () {
            console.log("storm initialize()")
            $('#up').click(storm.up);
            $('#down').click(storm.down);
            $('#left').click(storm.left);
            $('#right').click(storm.right);
            $('#center').click(storm.center);
            $('#standby').click(storm.toggleStandby);
        },
    
        showError: function (error) {
            console.error(error);
        },
        up: function(){
            storm.pitch = Math.max(storm.pitch - storm.pitchstep, 700);
            storm.actuate();
        },
        down: function(){
            storm.pitch = Math.min(storm.pitch + storm.pitchstep, 2300);
            storm.actuate();
        },
        left: function(){
            storm.yaw = Math.min(storm.yaw + storm.yawstep, 2300);
            storm.actuate();
        },
        right: function(){
            storm.yaw = Math.max(storm.yaw - storm.yawstep, 700);
            storm.actuate();
        },
        center: function(){        
            storm.pitch = 1500
            storm.yaw = 1500
            storm.actuate();
        },
        toggleStandby: function(){
            storm.standby = !storm.standby;
            storm.setStandby(storm.standby)
        },
        actuate(){
            console.log("actuate, pitch: " + storm.pitch +" , yaw: " + storm.yaw);
            if (storm.pitch != storm.lastpitch || storm.yaw != storm.lastyaw){
                storm.setPitchRollYaw(storm.pitch, 1500, storm.yaw)
                storm.lastpitch = storm.pitch
                storm.lastyaw = storm.yaw
            }    
        },
        getVersion: function(){
            var payload = null;
            storm.sendMessage(0x00, payload);  
        },
        setPitchRollYaw: function(pitch, roll, yaw){
            var payload = Uint16ToUint8Pair(pitch).concat(Uint16ToUint8Pair(roll)).concat(Uint16ToUint8Pair(yaw));
            storm.sendMessage(0x12, payload);
        },          
        setStandby: function(state){
            var payload = [state]
            storm.sendMessage(0x0E, payload);
        },
        // Format and send the message
        sendMessage: function(commandId, payload){
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
        }
    };

    storm.initialize();

    // Write to serial
    var serialWrite = function(data){
        app.sendString(data);
    }
  
  // Data formatting helper
    var Uint16ToUint8Pair = function(val){
        var bytes = [
        val & 0xff,
        val >> 8 & 0xff,
        ];
        return bytes;
    }
  
    // CRC (x.25) helper
    var getCrc = function(commandId, payload) {
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
        return Uint16ToUint8Pair(crc);
    };

    window.storm = storm;
})( window );