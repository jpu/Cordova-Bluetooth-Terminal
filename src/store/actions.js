import { LIST, ENABLED, LOADING, CONNECTED } from "./types";

export const getBluetoothDeviceList = ({ commit }) => {
	console.log("bluetooth: store: getBluetoothDeviceList()")
	commit(LOADING, true);
	bluetoothSerial.list(
		function (devices) {
			window.devices = devices;
			console.log(devices);
			var list = devices.filter(d => d.class == 7936);
			commit(LIST, list);
			commit(LOADING, false);
		}, 
		function(){ 
			console.error("bluetoothSerial.list(): Error, unable to get list of paired devices.")
		}
	)
};

export const getBluetoothEnabled = ({ commit }) => {
	console.log("bluetooth: store: getBluetoothDeviceList()")
	bluetoothSerial.isEnabled(
        function(){
          console.log("bluetoothSerial.isEnabled() returned true")
		  commit(ENABLED, true);
        }, 
        function(){
          console.log("bluetoothSerial.isEnabled() returned false")
          commit(ENABLED, false);
        }
    )
};

export const bluetoothDisconnectAsync = async function({ commit }){
	console.log("bluetooth: store: bluetoothDisconnectAsync()")
	return new Promise((resolve, reject) => {
		bluetoothSerial.disconnect( 
			function(){
				commit(CONNECTED, false);
				resolve(); 
			},
			function(){
				reject(); 
			}
		);
	});
};

export const bluetoothConnectAsync = async function({ commit }, deviceId){
	console.log("bluetooth: store: bluetoothDisconnectAsync()")
	return new Promise((resolve, reject) => {
		bluetoothSerial.connect( 
			deviceId,
			function(){
				commit(CONNECTED, true);
				resolve(); 
			},
			function(){
				commit(CONNECTED, false);
				reject(); 
			}
		);
	});
};



