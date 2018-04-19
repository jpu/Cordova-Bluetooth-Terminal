<template>
  <div id="app">
    <!-- <canvas id="videoCanvas"> -->
		<!-- <p>
			Please use a browser that supports the Canvas Element.
		</p>
	</canvas> -->
  <div class="wfsjs">
    <video id="video1" ref="video1" width="432" height="320" controls></video> 
    <div class="ratio"></div>
   </div>
    <router-view />
  </div>
</template>

<script>

import UdpSocket from "./components/udpsocket"; 
import Axios from "axios";
import Wfs from "./lib/wfs";
import H264Demuxer from './lib/wfs/demux/h264-demuxer';
//import JSMpeg from './lib/jsmpeg/src/jsmpeg'

export default {
  name: 'app',
  data() {
    return {
        wfs: null,
        h264Demuxer: null,
        player: null,
    }
  },
  methods: {
    onDeviceReady(){
       var url = 'udp://:8554';
       var url = 'ws://localhost:8084'
       //var canvas = document.getElementById('videoCanvas');
       this.wfs = new Wfs();    
       this.wfs.attachMedia(this.$refs.video1,'ch1');
       //this.h264Demuxer = new H264Demuxer(this.wfs);  
       window._wfs = this.wfs;
       //window._h264Demuxer = this.h264Demuxer;
       this.player = new JSMpeg.Player(url, {canvas:null, videoBufferSize: 128*1024, source: JSMpeg.Source.WebSocket, audio: false});
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