import Vue from 'vue'
import App from './App';
import VueRouter from 'vue-router';

import List from './pages/List'
import Details from './pages/Details'
import store from "./store/index";

Vue.use(VueRouter);

var router = new VueRouter({
  mode: 'hash',
  base: window.location.href,
  routes: [
    {
      name: 'root', 
      path: '/', 
      redirect: 'list'
    },
    {
      name: 'list', 
      path: '/list', 
      component: List
    },
    {
      name: 'details', 
      path: '/details', 
      props: true,
      component: Details
    },
  ]
});

new Vue({
  router: router,
  el: '#app',
  template: '<App/>',
  components: { App },
  store
})
