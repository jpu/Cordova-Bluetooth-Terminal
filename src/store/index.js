import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const state = {
	bluetoothEnabled: false,
	bluetoothDeviceList: [],
	bluetoothDeviceListLoading: true,
	bluetoothConnected: false
};

import { LIST, ENABLED, LOADING, CONNECTED } from "./types";

const mutations = {
	[LIST] (state, list) {
		state.bluetoothDeviceList.splice(0);
		state.bluetoothDeviceList.push(...list);
	},
	[ENABLED] (state, isEnabled) {
		state.bluetoothEnabled = isEnabled
	},
	[LOADING] (state, isLoading) {
		state.bluetoothDeviceListLoading = isLoading
	},
	[CONNECTED] (state, isConnected) {
		state.bluetoothConnected = isConnected
	},
};

import * as getters from "./getters";
import * as actions from "./actions";

export default new Vuex.Store({
	state,
	getters,
	actions,
	mutations
});