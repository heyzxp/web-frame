/**
 * 初始化appConfig
 */

import Vue from "vue";
let appConfig = require("./appConfig");
let pcMobileChange = require("../../createConfig/pcmobile.config.js");
let createAppConfig = require("../../createConfig/app.config.js");
let apiListAppConfig = require("../../createConfig/apilist.config.js");
createAppConfig = {...createAppConfig};

appConfig.port = location.port;
appConfig.domainName = location.hostname;
appConfig.baseUrl = location.protocol + "//" + location.hostname + (!location.port ? "" : ":" + location.port) + appConfig.routeBasePath;

if (process.env.NODE_ENV === "development") {
  appConfig.apiBaseUrl = appConfig.apiProtocol+ "://" + appConfig.devApi;
  
  //支持域名下二级目录
  appConfig.apiBaseUrl += process.env.VUE_APP_API_BASE;
} else {
  appConfig.apiBaseUrl = location.protocol +  '//' +location.hostname+ (['', '80', '8883'].includes(location.port) ? "" : ":" + location.port);
  
  //支持域名下二级目录
  appConfig.apiBaseUrl += process.env.VUE_APP_API_BASE;
}

appConfig.upFileUrl = appConfig.apiBaseUrl + '/site/attach?file=all/';
appConfig.uploadUrl = appConfig.apiBaseUrl;
appConfig.staticUrl = appConfig.baseUrl + "static/";

appConfig.apis = {...appConfig.apis, ...apiListAppConfig};
appConfig.pcMobileChange = pcMobileChange;
createAppConfig.customConfig = {...appConfig.customConfig, ...createAppConfig.customConfig};
appConfig = {...appConfig, ...createAppConfig};

window.appConfig = Vue.appConfig = Vue.prototype.$appConfig = appConfig;
