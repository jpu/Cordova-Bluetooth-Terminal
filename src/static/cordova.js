// mock bluetoothSerial object
// if we are not on cordova
if (typeof cordova === 'undefined' || !cordova){
    
    console.log("Can't get cordova. Are we on Android?");
    console.log("Setting up a mock bluetoothSerial...");

    const mockBluetoothSerial = {
      connected: false,
      subscriberResult: null,
      subscriberError: null,
      write: function(str){
          console.log(this.toHexString(str));
      },
      isEnabled: function(yes, no){
        yes();
      },
      list: function(result, error){
        result([
          { name: "alpha", id: "00:00:00:00:00:00", class: 7936},
          { name: "omega", id: "FF:FF:FF:FF:FF:FF", class: 7936}
        ]);
      },
      isConnected:  function(yes, no){
        if (this.connected){
          yes();
        } else {
          no();
        }
      },
      connect: function(id, result, error){
        this.connected = true;
        result();
      },
      disconnect: function(result, error){
        this.connected = false;
        result();
      },
      sendMockData(){
        //console.log("mockBluetoothSerial: sendMockData()");
        ;
      },
      subscribeRaw: function(result, error){
        console.log("mockBluetoothSerial: subscribeRaw()")
        window.temp1 = result;
        this.subscriberResult = result;
        this.subscriberError = error;
        var t = this;
        if (this.subscriberResult){
          console.log("mockBluetoothSerial: creating interval ...")
          this.dataGeneratorInterval = setInterval(function(){
            t.subscriberResult([0xFB]);
          }, 2000);
        } else {
          console.error("  subscriberResult does not exist, unable to create dataGeneratorInterval");
        }
      },
      unsubscribeRaw: function(result, error){
        console.log("mockBluetoothSerial: ussubscribeRaw()")
        this.subscriberResult = null;
        this.subscriberError = null;
        clearInterval(this.dataGeneratorInterval);
        result();
      },

      toHexString: function(byteArray) {
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
      }
    };
  
    window.bluetoothSerial = mockBluetoothSerial;
  } 