/**
 * 路由配置 动态生成而成
 */

export default {
	template: {
		<%_ for(var m in routerConfig) { _%>
		<%=m%>: {
			<%_ for(var p in routerConfig[m]) { _%>
      <%=p%>: {
		    comLoad: function (resolve) {
		    	require(['../merge/<%=m%>/<%=routerConfig[m][p].viewPath%>'], resolve);
		    },
		    metaInfo: {
					title: '<%=routerConfig[m][p].metaInfo.title%>',
					notNeedLogin: <%=routerConfig[m][p].notNeedLogin%>,
					loadedApis: <%-routerConfig[m][p].loadedApis%>,
					loadedApiParams: <%-routerConfig[m][p].loadedApiParams%>,
					guestMode: <%-routerConfig[m][p].guestMode%>,
					auth: '<%=routerConfig[m][p].auth%>',
					<%_ if(routerConfig[m][p].isIndexPage) {_%>
					isIndexPage: true,
					<%_ } _%>
					css: [
						<%_ for(var index in routerConfig[m][p].css) { _%>
						'<%=routerConfig[m][p].css[index]%>',
						<%_ } _%>
					],
					js: [
						<%_ for(var index in routerConfig[m][p].js) { _%>
							'<%=routerConfig[m][p].js[index]%>',
						<%_ } _%>		        	
					],
					<%_ if(routerConfig[m][p].isMobile) { _%>
					isMobile: <%-routerConfig[m][p].isMobile%>,
					<%_ } _%>
					<%_ if(routerConfig[m][p].isBackstage) { _%>
					isBackstage: <%-routerConfig[m][p].isBackstage%>,
					<%_ } _%>
		    }
		  },
		<%_ } _%>
  	},
	<%_}_%>		
	}
}










