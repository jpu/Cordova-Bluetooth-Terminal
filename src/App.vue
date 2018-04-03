<template>
  <div id="app">
    <canvas id="videoCanvas">
		<p>
			Please use a browser that supports the Canvas Element.
		</p>
	</canvas>
    <router-view />
  </div>
</template>

<script>

import UdpSocket from "./components/udpsocket"; 
import Axios from "axios";

export default {
  name: 'app',
  methods: {
    onDeviceReady(){
       var url = 'udp://:8554';
		   var canvas = document.getElementById('videoCanvas');
       var player = new JSMpeg.Player(url, {canvas:canvas, videoBufferSize: 512*1024, source: UdpSocket});
       
       window._axios = Axios;

      //  axios.get('http://10.5.5.9/gp/gpControl/execute?p1=gpStream&a1=proto_v2&c1=restart')
      //   .then(function (response) {
      //     console.log(response);
      //   })
      //   .catch(function (error) {
      //     console.log(error);
      //   });

    }
  },
  mounted (){
    // WIP: replace the websocket client interface with a new 'udp interface':
    // Create a jsmpeg client interface to handle udp data
    // coming in via a cordova plugin as base64 encoded binary data
    // //var url = "udp://10.5.5.9:8554";
    if (typeof cordova === 'undefined' || !cordova){
      this.onDeviceReady();
    } else {
      document.addEventListener('deviceready', this.onDeviceReady, false);
    }
    // WIP end
  }
}
</script>

<style>
  body, html {
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    background-color: #27272c !important;
  }
  #app{
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    box-sizing: border-box;
    font-size: 19px;
    color: #bebebe;
  }
</style>