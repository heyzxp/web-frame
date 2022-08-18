/**
 * 全局配置
 */

module.exports = {
  //端口
  port: '8883',

  //接口协议类型
  apiProtocol: 'https',

  //移动端最大支持的页面宽度
  mobileMaxWidth: 640,

  //本地调试，接口域名
  devApi: 'test-workflow.campusapp.com.cn',

  //网站根目录
  baseUrl: '',

  //接口根目录
  apiBaseUrl: '',

  //静态文件根目录
  staticUrl: '/' + process.env.VUE_APP_STATIC + '/',

  //路由二级路径
  routeBasePath: process.env.VUE_APP_PATH,

  //下载文件根目录
  uploadUrl: 'https://dev-officeflowimg.rlstech.cn/',

  //图片域名
  upImageUrl: 'http://test.officeflowimg.rlstech.cn/',

  //文件重命名地址
  upFileUrl: '',

  //默认uid的cookie key
  uidKey: 'vjuid',

  //资源版本
  sourceV: '0',

  //接口列表
  apis: {
    getCheckLogin: '/api/login/check-cas-login', //成电CAS验证
    frameToLogin: '/api/login/main', //去登录
    getSiteConfig: '/api/home/site-options', // 获取网站信息
    getSystemConfig: '/system/home/site-options', // 获取网站信息
    getAllAuth: '/site/user/auth', //获取用户权限
    getUserName: '/site/user/get-name', //获取用户名，id
    uploadindex: '/api/upload/index', //上传文件
    verificationCode: '/site/login/idiom-code' // 成语验证码
  },

  //数据来源
  source_types: {
    0: '未知',
    1: '注册',
    2: '后台添加',
    3: '脚本导入'
  },

  //路径转换列表
  pcMobileChange: [],

  //功能定制全局统一配置
  customConfig: {
    isToInfoCenter: true, //是否允许去个人信息中心

    //pdf下载方式
    isToPdf: {
      default: 1
    },

    ucenterPath: {
      default: 'site/personal'
    },

    //pdf下载协议
    toPdfHttp: 'https://',

    //嵌入式下载边距
    oldPrintPage: {
      margin: '20px'
    },

    //流式表单下载边距
    newPrintPage: {
      margin: '0'
    },

    //指定表单是横版还是竖版
    formLandscape: {}
  }
}
