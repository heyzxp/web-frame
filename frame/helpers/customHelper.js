/**
 * 功能自定义helper
 */
import Vue from "vue";
import nowAppConfig from "@/createConfig/app.config.js";

const customHelper = {
  /**
   * 指定学校指定事项的生成pdf方式类型
   */
  toPdfType(appId) {
    let config = this.getConfig('isToPdf');
    let defaultVal = (nowAppConfig.customConfig && nowAppConfig.customConfig.isToPdf) ? nowAppConfig.customConfig.isToPdf.default : false,
    manageSetToPdf = Vue.prototype.siteConfig.system_setting.cloud_print;
    return config[appId] ? config[appId] : defaultVal ? defaultVal : (manageSetToPdf == 'yes' ? 2 : 1);
    // return config[appId] ? config[appId] : config['default'];
  },

  /**
   * 获取当前学校，指定维度配置，没有则返回false
   * @param {string} dimension 
   */
  getConfig(dimension) {
    if(Vue.appConfig.customConfig && Vue.appConfig.customConfig[dimension]) {
      return Vue.appConfig.customConfig[dimension];
    }

    return false;
  },
  /**
   * 获取当前学校配置，指定id
   * @param {str} paramName
   * @param {num} id
   */
  getConfigId(paramName, id) {
    let config = this.getConfig(paramName);
    
    return config[id] ? config[id] : config['default'];
  }
}

export default customHelper