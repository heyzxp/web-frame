/**
 * 注册js 助手到Vue示例和对象中
 */

import customHelper from "customHelper";
import commonHelper from "commonHelper";
import statisticsHelper from "statisticsHelper";
import setLastData from "setLastData";
import jquery from "jquery";
import Vue from "vue";
import VueRouter from "vue-router";
import apiHelper from "apiHelper";

Vue.use(VueRouter)
Vue.customHelper = Vue.prototype.$customHelper = customHelper;
Vue.appCommonH = Vue.prototype.$appCommonH = commonHelper;
Vue.setLastData = Vue.prototype.$setLastData = setLastData;
Vue.StHelper = Vue.prototype.$StHelper = statisticsHelper;
Vue.apiHelper = Vue.prototype.$apiHelper = apiHelper;
window.$ = window.jQuery = jquery;

//loading状态
Vue.prototype.$selfloadingTime = 0;
Vue.prototype.$selfloadingBar = 0;
Vue.prototype.$selfloading = function (type, minTime, msg) {
	type = type ? type : 'show';
	minTime = minTime ? minTime : 500;
  
	switch(type) {
		case 'show':
			this.$selfloadingTime = 0;
			setTimeout(() => {
				if(this.$selfloadingTime == 0) {
					this.$selfloadingTime = (new Date()).getTime();
					this.$selfloadingBar = this.$loading({lock: true});
				} 
			}, minTime);

			break;
		case 'hide':
			//大于零说明已经显示，不大于0说明没有显示，将其修改为-1状态，说明已经执行隐藏，即使有即将显示也会被屏蔽掉
			if(this.$selfloadingTime > 0) {
				//延迟200毫秒隐藏
				this.$selfloadingTime = -1;
				setTimeout(() => {
					this.$selfloadingBar && this.$selfloadingBar.close && this.$selfloadingBar.close();
				}, 200);
			} else {
				this.$selfloadingTime = -1;
				this.$selfloadingBar && this.$selfloadingBar.close && this.$selfloadingBar.close();
			}

			break;
	}
}

/**
 * 数据脱敏处理
 * @param {*} nowStr 需要处理的字符串
 * @param {*} start 前面不处理部分
 * @param {*} end 后面不处理部分
 * @returns 
 */
Vue.prototype.$safeData = function(nowStr, start, end) {
	//如果是空格或者没有设置开始结束非脱敏长度，直接返回原字符串
	if(nowStr == '&nbsp;' || (!start && !end)) {
		return nowStr;
	}
	
	let nowStrArr = nowStr.split(''),
      newStr = '';

	nowStrArr.forEach((item, nowIndex) => {
		let lastIndex = nowStrArr.length - nowIndex;
		nowIndex++;
		
		if(nowIndex > start && lastIndex > end) {
			newStr += '*';
		} else {
			newStr += item;
		}
	})

	return newStr;
}













