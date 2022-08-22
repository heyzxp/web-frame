/**
 * 公共方法
 */

import Vue from "vue";
import jsToabc from 'js-md5';
const appCommonH = {};

/**
 * 新下载文件方法，绕过打开页面下载，需要用户允许弹窗
 * @param {*} url 
 */
appCommonH.downloadSelfFile = function (url) {
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 60000);
}

/**
 * 检查前端权限是否异常，使用无意义的函数名称
 * @param {*} nowControls 
 */
appCommonH.abcdeagwyysad = function (nowControls) {
  let uid = this.getCookie(this.getUidKey()),
      permits = nowControls.permits.join(','),
      web_permits = nowControls.web_permits.join(',');
      
  return jsToabc(nowControls.oldnum+uid+nowControls.issuper+permits+web_permits) == nowControls.random;
}

/**
 * 根据当前页面协议，替换资源协议
 * @param {string} path 
 */
appCommonH.repalceProtocol = function (path) {
  if(!window.location.href.includes('/cloudprintself/qrcode')) {
    return path;
  }

  if(path instanceof Array) {
    let newPath = [];

    path.forEach((one) => {
      newPath.push(this.repalceProtocolOne(one))
    })

    return newPath;
  } else {
    return this.repalceProtocolOne(path)
  }
}

/**
 * 替换协议
 * @param {*} path 
 * @returns 
 */
appCommonH.repalceProtocolOne = function (path) {
  let pathArr = path.split("//");

  if(['https:', 'http:'].includes(pathArr[0])) {
    if(pathArr[0] != location.protocol) {
      pathArr[0] = location.protocol;
      path = pathArr.join('//');
    }
  }

  return path;
}

/**
 * 获取公共静态资源中的路径
 * @param {string} path 资源路径，不以“/”开头
 */
appCommonH.staticPath = function (path) {
  return Vue.appConfig.staticUrl + path;
}

/**
 * 防抖方法
 */
appCommonH.debounce = function(key, callback, wait, setFunc) {
  if(typeof callback !== "function") {
    throw new TypeError('need a function');
  }

  let varName = 'debounce_'+key;
  if(window[varName]) {
    clearTimeout(window[varName]);
  }

  //当前防抖定制方法
  if(typeof setFunc === "function") {
    setFunc();
  }

  window[varName] = setTimeout(() => {
    callback();
  }, wait)
}

/**
 * 根据参数对象和url拼接url
 * @param  {[type]} url    [不带参数的url]
 * @param  {[type]} urlObj [参数对象]
 * @return {[type]}        [description]
 */
appCommonH.getUrlStr = function (url, urlObj) {
  url += "?";

  for (var key in urlObj) {
    if (urlObj[key]) url += key + "=" + urlObj[key] + "&";
  }

  return url.slice(0, -1);
}

/**
 * 获取用户uid cookie 的key
 * @return {[type]} [description]
 */
appCommonH.getUidKey = function () {
  return Vue.appConfig.userKeyPrefix ? Vue.appConfig.userKeyPrefix + '_' + Vue.appConfig.uidKey : Vue.appConfig.uidKey;
}

/**
 * 是否是空对象
 * @param  {[type]}  data [description]
 * @return {Boolean}      [description]
 */
appCommonH.isEmptyObj = function (data) {
  if (!data) return true;

  return !Object.keys(data).length;
}

/**
 * 首字母大写
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
appCommonH.firstUppercase = function (str) {
  if (!str) return false;

  str = str.toString();

  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

/**
 * 深层复制兑现
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
appCommonH.copyObj = function (obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * for 循环方式复制对象
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
appCommonH.copyObjFor = function (obj) {
  function deepCopy(obj) {
    if (typeof obj != 'object') {
      return obj;
    }

    var newobj = {};
    if (Array.isArray(obj)) {
      newobj = []
    } else if (obj === null) {
      newobj = null;
    }

    if (newobj !== null) {
      for (var attr in obj) {
        newobj[attr] = deepCopy(obj[attr]);
      }
    }

    return newobj;
  }

  return deepCopy(obj);
}

/**
 * 样式转换对象，数字自动拼接px
 * @param  {[type]} styleData [description]
 * @param  {[type]} other     [description]
 * @return {[type]}           [description]
 */
appCommonH.getStyle = function (styleData, other) {

  var styleData = this.copyObj(styleData);
  styleData = { ...styleData, ...other };

  for (var key in styleData) {
    if (Number(styleData[key]) !== NaN && isFinite(styleData[key])) {
      styleData[key] = styleData[key] + "px";
    }
  }

  return styleData;
};

/*触发事件 类似有jquery tigger*/
appCommonH.fireEvent = function (element, event) {
  if (document.createEventObject) {
    // IE浏览器支持fireEvent方法
    var evt = document.createEventObject();
    return element.fireEvent('on' + event, evt)
  }
  else {
    // 其他标准浏览器使用dispatchEvent方法
    var evt = document.createEvent('HTMLEvents');
    evt.initEvent(event, true, true);
    return !element.dispatchEvent(evt);
  }
};

/**
 * 判断是不是微信和手机
 */
appCommonH.isWeixin = function () {
  var u = navigator.userAgent;
  var isPKUIOS = u.indexOf('PKUiOS') > -1;
  var isPKUAndroid = u.indexOf('PKUAndroid') > -1;
  var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 || isPKUAndroid; //android终端
  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) || isPKUIOS; //ios终端
  var isPhone = isAndroid || isiOS
  u = u.toLowerCase()
  var isWeixin = u.match(/MicroMessenger/i) == 'micromessenger' || u.match(/_SQ_/i) == '_sq_'
  return {
    isWeixin, isPhone, isAndroid, isiOS
  }
}

/**
 * 获取当前链接地址
 */
appCommonH.getCurrUrl = function (fullPath) {
  try {
    let nowUrl = Vue.appConfig.baseUrl.slice(0, -1) + (fullPath || Vue.appRouter.currentRoute.fullPath);
    let arrReg = ['<', '>', ',', '$', '\\(', '\\)']
    arrReg.forEach(item => {
      nowUrl = nowUrl.replace(item, '')
    })
    return encodeURIComponent(nowUrl);
  } catch($e) {
    let nowUrl = window.location.href;
    let arrReg = ['<', '>', ',', '$', '\\(', '\\)']
    arrReg.forEach(item => {
      nowUrl = nowUrl.replace(item, '')
    })
    return encodeURIComponent(nowUrl);
  }
}

/**
 * 获取cookie值
 */
appCommonH.getCookie = function (name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}

/**
 * 计算时间差
 * @param {*}
 */
appCommonH.getSpendTime = function (startTime, endTime) {
  if (startTime == undefined) return
  startTime = startTime.replace(/\-/g, "/");//兼容ios时间转换
  if (endTime != null) {
    endTime = endTime.replace(/\-/g, "/");
    var T = new Date(endTime).getTime() - new Date(startTime).getTime();
  } else {
    var T = new Date().getTime() - new Date(startTime).getTime();
  }

  var d = parseInt(T / 1000 / 60 / 60 / 24);
  var h = parseInt(T / 1000 / 60 / 60 % 24);
  var m = parseInt(T / 1000 / 60 % 60);

  if (d == 0 && h == 0 && m <= 0) {
    return '一分钟以内'
  }
  if (d == 0 && h == 0) {
    return m + '分钟'
  }
  if (d == 0) {
    return h + '小时' + m + '分钟'
  }
  return d + '天' + h + '小时' + m + '分钟'
}

/**
 * 获取get参数
 * @param  {[type]} vm   [description]
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
appCommonH.query = function (name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);

  if (r != null) return unescape(r[2]); return null;
}

// 获取url中全部参数
appCommonH.getUrlParam = function (url) {
  if(url.split('?')[1]) {
    var match = url.split('?')[1].split('#')[0];
    if (!match) return {};
    var matches = match.split('&');
    var obj = {};
    for (var i = 0; i < matches.length; i++) {
      var key = matches[i].split('=')[0];
      var value = matches[i].split('=')[1];
      obj[key] = value;
    }
    return obj;
  }else {
    return "";
  }
}

/**
 * 页面预加载数据，添加数据到vue
 */
appCommonH.setVueData = function (vm, data) {
  for (var dkey in data) {
    vm[dkey] = data[dkey];
  }
}

/**
 * 获取当前站点标识
 * @return {[type]} [description]
 */
appCommonH.getWebId = function () {
  return Vue.appConfig.webId;
}

/**
 * 合并对象
 * @param  {[type]} obj1 [description]
 * @param  {[type]} obj2 [description]
 * @return {[type]}      [description]
 */
appCommonH.mergeObj = function (obj1, obj2, obj3) {
  obj1 = obj1 ? obj1 : {};
  obj2 = obj2 ? obj2 : {};
  obj3 = obj3 ? obj3 : {};

  return { ...obj1, ...obj2, ...obj3 };
}

/**
 * 获取指定时间指定格式
 * @param  {[type]} format [时间格式]
 * @param  {[type]} time   [使用时间，默认为当前时间]
 * @return {[type]}        [description]
 */
appCommonH.getStrTime = function (format, time) {
  var timeObj = time ? new Date(time) : new Date(),
    timeInfo = {};

  timeInfo["Y"] = timeObj.getFullYear();
  timeInfo["m"] = timeObj.getMonth() + 1;
  timeInfo["d"] = timeObj.getDate();
  timeInfo["H"] = timeObj.getHours();
  timeInfo["i"] = timeObj.getMinutes();
  timeInfo["s"] = timeObj.getSeconds();

  timeInfo["m"] = timeInfo["m"] >= 10 ? timeInfo["m"] : '0' + timeInfo["m"];
  timeInfo["d"] = timeInfo["d"] >= 10 ? timeInfo["d"] : '0' + timeInfo["d"];
  timeInfo["H"] = timeInfo["H"] >= 10 ? timeInfo["H"] : '0' + timeInfo["H"];
  timeInfo["i"] = timeInfo["i"] >= 10 ? timeInfo["i"] : '0' + timeInfo["i"];
  timeInfo["s"] = timeInfo["s"] >= 10 ? timeInfo["s"] : '0' + timeInfo["s"];

  for (var key in timeInfo) {
    format = format.replace(key, timeInfo[key]);
  }

  return format;
}

/**
 * 数组元素调换顺序方法
 * @param  {[type]} arr    [数组]
 * @param  {[type]} index1 [添加元素的位置]
 * @param  {[type]} index2 [删除元素的位置]
 * @return {[type]}        [description]
 */
appCommonH.swapArray = function (arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0];

  return arr;
}

/**
 * 获取系统自动生成的浏览器标题
 * @return {[type]} [description]
 */
appCommonH.getDocumentTitle = function (title, path) {
  document.title = title;
}

/**
 * 设置url参数
 * @param {[type]} url    [description]
 * @param {[type]} params [description]
 */
appCommonH.setGetUrl = function (url, params) {
  var paramsStr = "";

  for (var key in params) {
    if (params[key] != undefined) {
      paramsStr += key + "=" + params[key] + "&";
    }
  }

  if (paramsStr) {
    paramsStr = paramsStr.slice(0, -1);
  }

  return url + "?" + paramsStr;
}

/**
 * 关闭当前页面
 * @return {[type]} [description]
 */
appCommonH.closePage = function () {
  var browserName = navigator.appName;

  if (browserName == "Netscape") {
    window.open('', '_self', '');
    window.close();
  }

  if (browserName == "Microsoft Internet Explorer") {
    window.parent.opener = "whocares";
    window.parent.close();
  }
}

/**
 * 链接是不是一个链接判断
 * @param {str} 链接地址
 */
appCommonH.isUrl = function (url) {
  var r = /^(?=^.{3,255}$)(http(s)?:\/\/)(www\.)?/
  return r.test(url)
}

/**
 * 获取字符串长度
 * @param  {str} 字符串
 * @return {num}  字符串长度
 */
appCommonH.getWordLength = function (str) {
  var len = 0;
  try {
    //先将回车换行符做特殊处理
    str = str.replace(/(\r\n+|\s+|　+)/g, "龘");
    //处理英文字符数字，连续字母、数字、英文符号视为一个单词
    // str = str.replace(/[\x00-\xff]/g, "m");
    //合并字符m，连续字母、数字、英文符号视为一个单词
    // str = str.replace(/m+/g, "*");
    //去掉回车换行符
    str = str.replace(/龘+/g, "");
    //返回字数
    len = str.length;
  } catch (e) {

  }
  return len;
}

/**
 * 判断字符串长度是否在设置范围内
 * @param {str} 字符串
 * @param {num} 最大字符
 * @param {num} 最小字符
 */
appCommonH.validateWordNumber = function (str, maxNum, minNum) {
  var length = appCommonH.getWordLength(str);
  if (maxNum && minNum) {
    return !!(length <= maxNum && length >= minNum)
  } else if(maxNum && !minNum) {
    return !!(length <= maxNum)
  } else if(!maxNum && minNum) {
    return !!(length >= minNum)
  }
}

export default appCommonH;
