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

export default {
  name: 'app',
  mounted (){
    // WIP: replace the websocket client interface with a new 'udp interface':
    // Create a jsmpeg client interface to handle udp data
    // coming in via a cordova plugin as base64 encoded binary data
		var client = new WebSocket( 'ws://127.0.0.1:8084/' );
		var canvas = document.getElementById('videoCanvas');
    var player = new jsmpeg(client, {canvas:canvas});
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