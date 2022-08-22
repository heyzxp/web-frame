/**
 * api 助手
 */
import Vue from "vue";

const apiHelper = {
  /**
   * 根据api key获取完整的api 路径
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  getApi:function(key){
    var uri = Vue.appConfig.apis[key];
    if(!uri) return "";

    if(process.env.NODE_ENV == "development") {
      return '/api' + uri;
    } else {
      return Vue.appConfig.apiBaseUrl + uri;
    }
  }
}

export default apiHelper;
