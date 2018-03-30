<template>
  <div class="details">
    <div class="header">
      <button class="button back" v-on:click="backClicked">Back</button>
      <div class="name">{{ $route.params.item.name }}</div>
      <button v-if="error" class="button error" v-on:click="errorClicked">ERROR</button>
    </div>
     <div class="connecting" v-if="bluetoothConnecting">
        Connecting ...
      </div>
      <div class="connecting" v-if="!bluetoothConnecting && !bluetoothConnected">
        Disconnected
      </div>
    <div class="device" v-if="!bluetoothConnecting">
      
      <div class="controls" v-if="bluetoothConnected">

        <div class="row">
          <button id="up" v-on:click="up">Up</button>
        </div> 

        <div class="row">
          <button id="left" v-on:click="left">Left</button>
          <button id="center" v-on:click="center">Center</button>
          <button id="right" v-on:click="right">Right</button>
        </div>

        <div class="row">
          <button id="down" v-on:click="down">Down</button>
        </div> 

      </div>
      <div class="commands" v-if="bluetoothConnected">
          <button id="version" v-on:click="getVersion">Get version</button>
          <button id="standby" v-on:click="toggleStandby">Standby</button>
      </div>
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from "vuex";
import Storm from "../components/storm";

export default {
  name: 'details2',
  computed: mapGetters([
        "bluetoothConnected",
  ]),
  data() {
    return {
        name: null,
        error: false,
        storm: null,
        bluetoothConnecting: true
    }
  },
  watch: {
    bluetoothConnected: function(newVal, oldVal){
      bluetoothConnecting = false;
      if (newVal === true){
        console.log("bluetoothConnected changed to " + newVal);
      }
    },
  },
  methods: {
    up(){
      this.storm.up();
    },
     down(){
      this.storm.down();
    },
    left(){
      this.storm.left();
    },
    right(){
      this.storm.right();
    },
    center(){
      this.storm.center();
    },
    toggleStandby(){
      this.storm.toggleStandby();
    },
     getVersion(){
      this.storm.getVersion();
    },
    ...mapActions([
        "bluetoothConnectAsync",
        "bluetoothDisconnectAsync",
			]),
    async backClicked(){
      await this.bluetoothDisconnectAsync();
      this.$router.back()
    },
    errorOccurred(){
      this.error = true;
    },
    errorClicked(){
      this.error = false;
      this.$router.back();
    },
    onSerialDisconnectSuccess(){
      console.log("onSerialDisconnectSuccess()");
      //this.connected = false;
      bluetoothSerial.unsubscribeRawData(
          this.onSerialUnsubscribeSuccess, 
          this.onSerialUnsubscribeError
        );
    },
    onSerialUnsubscribeSuccess(){
      console.log("onSerialUnsubscribeSuccess()");
    }, 
    onSerialUnsubscribeError(err){
      console.log("onSerialUnsubscribeError()");
      console.error(err);
      this.error = true;
    },
    onSerialDisconnectError(err){
      console.log("onSerialDisconnectError()");
      console.error(err);
      this.error = true;
    },
    onSerialDataReceived(data){
      console.log("onSerialDataReceived(): " + data);
    },
    onSerialDataError(err){
      console.log("onSerialError()");
      console.error(err);
    }
  },
  created (){
    this.name = this.$route.params.item.name;
  },
  async mounted (){
    try{
      await this.bluetoothConnectAsync(this.$route.params.item.id);
      console.log("connected, now subscribe.");
      bluetoothSerial.subscribeRawData(
        this.onSerialDataReceived, 
        this.onSerialError
      );
      this.storm = new Storm(bluetoothSerial.write);
      this.error = false;
    } catch (ex){
      console.error("Unable to connect to bluetooth device");
      this.error = true;
      this.bluetoothConnecting = false;
    }
    
  },
  async beforeDestroy(){
    try{
      await this.bluetoothDisconnectAsync();
    } catch (ex){
      console.error(ex);
    }
  }
};
</script>

<style lang="scss" scoped>
  button {
    &:focus {
      outline:0;
    }
  }

  .header {
    background-color: #666;
    color: #ddd;
    font-weight: bold;
    padding: 20px 20px;
    text-align: center;
    .button {
      position: absolute;
      background: transparent;
      border: none;
      color: #7ad7ec;
      font-size: 1em;
      top: 20px;
      &.back{
        left: 20px;
      }
      &.error{
        right: 20px;
        color: #ff6c6c;
      }
      &:active {
        color: white;
      }
    }
  }
  .connecting {
    padding: 20px;
    text-align: center;
  }
  .device {
    padding: 20px;
    text-align: center;
    .controls {
      button{
        width: 25%;
        height: 80px;
        margin: 5px 2%;
        background: #424d58;
        border-radius: 30px;
        color: #7aa8ab;
        font-size: 10px;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        &:active {
          background: #7fb1d0;
          color: #8ee4e8;
        }
      }
    }
    .commands {
      position: absolute;
      bottom: 0px;
      margin: auto;
      width: 100%;
      box-sizing: border-box;
      left: 0;
      button{
        height: 40px;
        margin: 10px;
        background: transparent;
        border: none;
        color: #7ad7ec;
        font-size: 1em;
        top: 20px;
        &:active {
          color: white;
        }
      }
    }
  }
</style>