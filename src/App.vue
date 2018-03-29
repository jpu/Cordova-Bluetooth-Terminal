<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>

export default {
  name: 'app',
  mounted (){
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