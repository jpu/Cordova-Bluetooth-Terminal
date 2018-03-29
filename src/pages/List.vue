<template>
  <div class="container">
    <div class="header">
      Connect
      <button class="refresh-button" v-on:click="refreshClicked">Refresh</button>
    </div>
    <div class="loading" v-if="bluetoothDeviceListLoading">Loading</div>
    <div class="list" v-if="!bluetoothDeviceListLoading">
      <div class="item" v-for="item in bluetoothDeviceList" :key="item.id" v-on:click="itemClicked(item)">
        <span class="item-name">{{ item.name }}</span>
        <span class="item-id">{{ item.id }}</span>
      </div>
    </div>
    <div class="footer">
      Device not in list? Pair it first in Android settings.
    </div>
  </div>
</template>

<script>

import { mapActions, mapGetters } from "vuex";

export default {
  name: 'list',
  computed: mapGetters([
      "bluetoothEnabled",
      "bluetoothDeviceList",
      "bluetoothDeviceListLoading"
		]),
  data() {
    return {
    }
  },
  watch: {
    bluetoothEnabled: function(newVal, oldVal){
      if (newVal === true){
        this.getBluetoothDeviceList();
      }
    },
  },
  methods: {
    ...mapActions([
         "getBluetoothEnabled",
         "getBluetoothDeviceList",
			]),
    onDeviceReady(){
      this.getBluetoothEnabled();
    },   
    itemClicked(item) {
      console.log("itemClicked, name " + item.name);
      this.$router.push({ name: "details", params: {item: item} })
    },
    refreshClicked() {
      this.getBluetoothDeviceList();
    }
  },
  created (){
    console.log("list created");
  },
  mounted (){
    console.log("list mounted");
    if (typeof cordova === 'undefined' || !cordova){
      this.onDeviceReady();
    } else {
      document.addEventListener('deviceready', this.onDeviceReady, false);
    }
  }
};
</script>

<style lang="scss" scoped>
  button:focus {
    outline: 0;
  }

  .header {
    background-color: #666;
    color: #ddd;
    font-weight: bold;
    padding: 20px 20px; 
    .refresh-button {
      position: absolute;
      right: 20px;
      background: transparent;
      border: none;
      color: #7ad7ec;
      font-size: 1em;
      &:active {
        color: white;
      }
    }
  }
  .loading {
    padding: 20px 20px; 
  }
  .list {
    top: 64px;
    .item {
      padding: 20px 20px; 
      width: 100%;
      text-align: left; 
      border-top: #444 solid 1px;
      width: 100%;
      box-sizing: border-box;
      &:last-child {
        border-bottom: #444 solid 1px;
      }
      .item-name {
        margin: 0;
        word-wrap: break-word;
        color: #7ad7ec;
      }
      .item-id {
        font-size: 0.8rem;
        color: #999;
        margin: 5px;
        float: right;
        display: inline-block;
      }
    }
  }
  .footer {
    padding: 20px 20px;
    font-size: 14px;
  }
</style>