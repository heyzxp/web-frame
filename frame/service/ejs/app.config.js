/**
* 网站自动生成的基础配置
*/
let Vue = require("vue");

module.exports = {
	  /**
	   * 环境id
	   * @type {String}
	   */
	  webId: '<%=config.webId%>',

		/**
		 * 运行环境id
		 */
		envWebId: '<%=config.envWebId%>',

	  /**
	   * 登录地址
	   * @type {String}
	   */
	  login: '<%=config.login%>',
	
	  /**
	   * 退出登录地址
	   * @type {String}
	   */
	  logout: '<%=config.logout%>',
	
	  /**
	   * cookie前缀
	   * @type {String}
	   */
	  userKeyPrefix: '<%=config.userKeyPrefix%>',

    /**
		 * 页面版本
		 */
    pageVersion: '<%=config.pageVersion%>',

		/**
		 * 当前版本号
		 */
		version: '<%=config.version%>',
		
		/**
		 * 环境
		 */
		env: '<%=config.env%>',

		/**
		 * 版本号
		 */
		sourceV: <%=sourceV%>,

		/**
		 * 功能定制全局统一配置
		 */
		customConfig: <%-(config.customConfig ? config.customConfig : '{}')%>,
		
	  <%_ if(config.onlyClient) {_%>
	  /**
	   * 只允许访问的客户端：pc：只允许访问pc端，mobile：值允许访问移动端
	   */
	  onlyClient: <%-config.onlyClient%>,
	  <%_ } else { _%>
	  /**
	   * 只允许访问的客户端：pc：只允许访问pc端，mobile：值允许访问移动端
	   */
	  onlyClient: function() {
	    return false;
	  },
	  <%_ } _%>
};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	