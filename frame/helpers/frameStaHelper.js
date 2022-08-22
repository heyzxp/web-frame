/**
 * 统计 helper
 * 
 * @author  李刚
 */

/**
 * 统计助手
 */
import Vue from "vue";

const StHelper = {
	/**
	 * 变量容器名
	 * @type {String}
	 */
	_varKey: '$STATISTICS',

	/**
	 * 是否加载完成
	 */
	loaded: false,

	/**
	 * 初始化变量容器
	 * @return {[type]} [description]
	 */
	init() {
		window[this._varKey] = [];
		this.loaded = false;

		if(!Vue.appRouter.app.$route.meta.loadedApis.length) {
			this.pageLoaded();
		}
	},

	/**
	 * 添加新接口
	 * @param {[type]} apiKey      [本次接口调用的key]
	 */
	add(apiKey) {
		if(!Vue.appRouter.app.$route.meta.loadedApis.length) return;

    if(Vue.appRouter.app.$route.meta.loadedApis.includes(apiKey) && !window[this._varKey].includes(apiKey)) {
			window[this._varKey].push(apiKey);
		}
		
		if(Vue.appRouter.app.$route.meta.loadedApis.length === window[this._varKey].length) {
			this.pageLoaded();
		}
	}
}

export default StHelper;























