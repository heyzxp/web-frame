/**
 * 模板配置文件 base类
 * @type {[type]}
 */
var path = require('path');
import Vue from "vue";
import VueRouter from "vue-router";
import md5 from "js-md5";

//重写路由replace和push方法，解决element ui导航引起的问题
const originalPush = VueRouter.prototype.push,
			originalReplace = VueRouter.prototype.replace;

VueRouter.prototype.push = function push(location) {
	return originalPush.call(this, location).catch(err => err)
}

VueRouter.prototype.replace = function replace(location) {
	return originalReplace.call(this, location).catch(err => err)
}

const appConfig = Vue.appConfig;
const baseTpl = function (params) {
	this.Router = null;

	this.template = params.template ? params.template : null;
	this.cssInfo = params.cssInfo ? params.cssInfo : null;
	this.publicCss = params.publicCss ? params.publicCss : [];
	this.styleCss = params.styleCss ? params.styleCss : {};
	this.publicJs = params.publicJs ? params.publicJs : [];
	this.needLogins = params.needLogins ? params.needLogins : [];
	this.notneedLogins = params.notneedLogins ? params.notneedLogins : [];
	this.scrollConfig = params.scrollConfig ? params.scrollConfig : null;
}

/**
 * 检查配置
 * @return {[type]} [description]
 */
baseTpl.prototype.checkConfig = function() {
	if(!this.template || !this.checkTemplate()) {
		console.error("template 模板配置错误！");

		return false;
	}

	return true;
};

/**
 * 检查模板配置
 * @return {[type]} [description]
 */
baseTpl.prototype.checkTemplate= function() {
	var pageNum = 0;

	for(var moduleName in this.template) {
		var moduleInfo = this.template[moduleName];

		for(var pageName in moduleInfo) {
			var pageInfo = moduleInfo[pageName];

			if(!pageInfo.comLoad || typeof pageInfo.comLoad != "function") {
				console.error(moduleName+"模块， "+pageName+"页面，comLoad函数设置错误！");

				return false;
			}

			if(!pageInfo.metaInfo || !pageInfo.metaInfo.title) {
				console.error(moduleName+"模块， "+pageName+"页面，metainfo设置错误！");

				return false;
			}

			pageNum++;
		}
	}

	if(!pageNum) {
		console.error("最少应该有一个页面！");

		return false;
	}

	return true;
};

/**
 * 实例化路由
 * @param  {[array]} routes [路由配置]
 * @return {[object]}        [路由对象]
 */
baseTpl.prototype.getBaseRouter = function(routes) {
	if(this.Router) {
		return this.Router;
	} else {
		//实例化路由
		this.Router = new VueRouter({
			mode: 'history',
			routes: routes,
			base: appConfig.routeBasePath,
			scrollBehavior: function(to, from, savedPosition) {
				return {x: 0, y: 0};
			}
		});

		//each 结束后加载完成进度条
		var _this = this;
		this.Router.afterEach(function(to) {
			_this.progressEnd();
			
			//初始化统计
			Vue.StHelper.init();
		})

		//基本信息加载
		this.pcMobileDo(this.Router);
		this.loadMetaInfo(this.Router);
		this.loadOtherSource(this.Router);
		
		return this.Router;
	}
}

/**
 * 加载路由和模板页面
 * @return {[type]} [description]
 */
baseTpl.prototype.loadRouter = function() {
	if(!this.checkConfig()) return false;
	
	var routes = [],
		template = this.template,
		defaultView = null;
		
	for(var folder in template) {
		var nowModules = template[folder];

		for(var mName in nowModules) {
			var nowRouterInfo = {
				name: mName,
				path: "/"+folder+"/"+mName,
				component: nowModules[mName]["comLoad"],
				caseSensitive: true,// url地址是否大小写
				meta: nowModules[mName]["metaInfo"]
			};

			routes.push(nowRouterInfo);
			if(nowModules[mName]["metaInfo"].isIndexPage) {
				defaultView = {...{}, ...nowRouterInfo};
			}
		}
	}

	//设置默认加载页面
	defaultView.path = "*";
	routes.push(defaultView);

	return this.getBaseRouter(routes);
}

/**
 * 获取定制化require方法
 * @param  {[type]} directory [相对模块路径]
 * @return {[type]}           [description]
 */
baseTpl.prototype.getRequire = function(selfRequire) {
	return function(moduleName, resolve) {
		return selfRequire("./"+moduleName, resolve);
	}
}

/**
 * 根据当前客户端类型进行处理
 */
baseTpl.prototype.pcMobileDo = function(Router) {
	Router.beforeEach((to, from, next) => {
		if(this.pcToMobile(Router, to, next)) {
			return false;
		}
		
		this.setMobileRem(to);

		next();
	})
}

/**
 * 路由访问时加载元信息
 * @return {[type]} [description]
 */
baseTpl.prototype.loadMetaInfo = function(Router) {
	Router.beforeEach((to, from, next) => {
		this.progressStart();

		if(to.meta.title) Vue.appCommonH.getDocumentTitle(to.meta.title, to.path);
		if(to.meta.desc) document.desc = to.meta.desc;

		next();
	});
}

//资源列表
baseTpl.prototype.sourceArrs = {};

//资源加载总数
baseTpl.prototype.loadAllNum = 0;

//加载成功会掉方法
baseTpl.prototype.sourceCallBack = null;

/**
 * 第三方资源加载
 * @param  {[type]} Router [description]
 * @return {[type]}        [description]
 */
baseTpl.prototype.loadOtherSource = function(Router) {
	var _this = this;

	Router.beforeEach(function(to, from, next) {
		_this.clearSource(to);
		var publicCss = _this.publicCss ? _this.publicCss : [],
			publicJs = _this.publicJs ? _this.publicJs : [],
			selfCss = to.meta.css,
			selfJs = to.meta.js;
		
		var sourceArrs = {
			css: [...publicCss, ...selfCss],
			js: [...publicJs, ...selfJs],
		};

		if(!sourceArrs.css.length && !sourceArrs.js.length) {
			_this.deleteSource(to);

			next();
		} else {
			_this.sourceArrs = sourceArrs;
			_this.registerSource(to, next);
		}
	});
};


/**
 * 注册要引入的css和js资源，注册后清空上一次的注册
 * @param  {[type]} sourceArr [列表]
 * @return {[type]}           [description]
 */
baseTpl.prototype.registerSource = function(to, next) {
	this.sourceCallBack = next;

	this.loadCssSource(to);
	this.loadJsSource(to);
	this.deleteSource(to);
}

/**
 * 清空资源加载状态
 * @return {[type]} [description]
 */
baseTpl.prototype.clearSource = function(to) {
	this.sourceArrs = [];
	this.loadAllNum = 0;
	this.sourceCallBack = null;
}

/**
 * 加载css资源
 * @return {[type]}           [description]
 */
baseTpl.prototype.loadCssSource = function(to) {
	var _this = this,
			path = to.path;
	
	this.sourceArrs.css.forEach(function(cssOne) {
		var allPath = /^(http|https):\/\//.test(cssOne) ? cssOne : appConfig.staticUrl+cssOne,
			md5Key = md5(allPath);

		_this.loadAllNum++;
		if(!$('[data-id="'+md5Key+'"]').length) {
			var cssHtml = '<link source-type="other" page-path="'+path+'" data-id="'
			+md5Key+'" href="'
			+allPath+'?v='
			+appConfig.sourceV+'" rel="stylesheet" type="text/css"/>';

			$("head").append(cssHtml);

			$('[data-id="'+md5Key+'"]').on("load", function() {
				_this.loadSourceSuccess();
			});
		} else {
			$('[data-id="'+md5Key+'"]').attr("page-path", path);

			setTimeout(function() {
				_this.loadSourceSuccess();
			}, 200);
		}
	})
}

/**
 * 加载js资源
 * @return {[type]} [description]
 */
baseTpl.prototype.loadJsSource = function(to) {
	var _this = this,
			path = to.path;

	this.sourceArrs.js.forEach(function(jsPath) {
		var allPath = /^(http|https):\/\//.test(jsPath) ? jsPath : appConfig.staticUrl+jsPath,
			md5Key = md5(allPath);

		_this.loadAllNum++;
		
		if(!$('[data-id="'+md5Key+'"]').length) {
			var jsScript = document.createElement("script");
			jsScript.src = allPath+'?v='+appConfig.sourceV;
			jsScript.setAttribute("data-id", md5Key);
			jsScript.type = "text/javascript";
			jsScript.async = false;
			jsScript.setAttribute("data-path", jsPath);
			jsScript.setAttribute("source-type", 'other');
			jsScript.setAttribute("page-path", path);
			jsScript.onload = function() {

				_this.loadSourceSuccess();
			};

			document.getElementsByTagName("body")[0].appendChild(jsScript);
		} else {
			$('[data-id="'+md5Key+'"]').attr("page-path", path);

			setTimeout(function() {
				_this.loadSourceSuccess();
			}, 200);
		}
	})
}

/**
 * 删除当前页面不需要的资源
 */
baseTpl.prototype.deleteSource = function(to) {
	if($('[source-type="other"]').length) {

		$('[source-type="other"]').each((index, source) => {
			if($(source).attr("page-path") !== to.path) {
				$(source).remove();
			}
		})
	}
}

/**
 * 加载资源成功会掉方法
 * @return {[type]} [description]
 */
baseTpl.prototype.loadSourceSuccess = function() {
	this.loadAllNum--;
	if(!this.loadAllNum) {
		this.sourceCallBack();
	}
}

/**
 * 模块加载前，回调函数
 * @param  {[type]} Router [description]
 * @return {[type]}        [description]
 */
baseTpl.prototype.beforeEnterModule = function(Router) {

}

//进度条选择器
baseTpl.prototype.progressSelector = "progress_loading";

/**
 * 开始显示进度条
 * @return {[type]} [description]
 */
baseTpl.prototype.progressStart = function() {
	if(!$("#"+this.progressSelector).length) {
		var progressHtml = '<div id="'+this.progressSelector+'">'
								+'<div></div>'
						   +'</div>';

		$("body").append(progressHtml)
	}

	this.clearProgress();
	if(!window.location.hash || window.location.hash.indexOf("module_") === -1) {
		$("#"+this.progressSelector).show();
	}
	
	this.progressNum = 0;
	this.progressChange(98, 3000);
}

/**
 * 结束显示进度条
 * @return {[type]} [description]
 */
baseTpl.prototype.progressEnd = function() {
	if($(".frame-loader").length) {
		$(".frame-loader").remove();
	}

	this.progressChange(100, 200);
}

//周期循环句柄
baseTpl.prototype.progressClearBar = null;

//进度具体数值
baseTpl.prototype.progressNum = 0;

/**
 * 进度条改变事件
 * @param  {[type]} endnum [结束进度]
 * @param  {[type]} time   [所用时间]
 * @return {[type]}        [description]
 */
baseTpl.prototype.progressChange = function(endnum, time) {
	var stepTime = 20,
		stepNum = (endnum - this.progressNum) / (time / stepTime),
		_this = this;


	clearInterval(_this.progressClearBar);
	_this.progressClearBar = setInterval(function() {
		$("#"+_this.progressSelector).find("div").width(_this.progressNum+"%");

		if(_this.progressNum >= endnum) {
			clearInterval(_this.progressClearBar);
			if(_this.progressNum >= 100) {
				$("#"+_this.progressSelector).hide();
				_this.clearProgress();
			}

			return false;
		}

		_this.progressNum += stepNum;
	}, stepTime);
}

/**
 * 清空进度条进度
 * @return {[type]} [description]
 */
baseTpl.prototype.clearProgress = function() {
	$("#"+this.progressSelector).find("div").width("0%");
}

/**
 * 设置移动端或者pc端页面顶级类
 */
baseTpl.prototype.setClientClass = function(isMobile) {
	if(isMobile) {
		if($("body").hasClass("site_pc_common")) {
			$("body").removeClass("site_pc_common");
		}

		if(!$("body").hasClass("site_mobile_common")) {
			$("body").addClass("site_mobile_common");
		}
	} else {
		if($("body").hasClass("site_mobile_common")) {
			$("body").removeClass("site_mobile_common");
		}
		
		if(!$("body").hasClass("site_pc_common")) {
			$("body").addClass("site_pc_common");
		}
	}
}

/**
 * 根据配置，判断如果是手机环境，并且是pc页面，跳转对应手机页面
 * 手机端和窗口宽度小于指定宽度，则判断为手机端
 * @return {[type]} [description]
 */
baseTpl.prototype.pcToMobile = function(Router, to, next) {
	var nowPage = to.matched && to.matched.length && to.matched[0];
	if(!nowPage) return false;

	var eventIsPhone = window.innerWidth <= appConfig.mobileMaxWidth,
		nowPath = nowPage.path,
		pageIsPhone = !!to.meta.isMobile,
		pcMobileChange = appConfig.pcMobileChange

	//如果设置仅允许访问的客户端类型
	if(appConfig.onlyClient()) {
		let onlyIsPhone = appConfig.onlyClient() == 'mobile';
		
		eventIsPhone = onlyIsPhone;
	}

	if(eventIsPhone !== pageIsPhone) {
		var nowKey = pageIsPhone ? "mobilePath" : "pcPath",
			jumpKey = pageIsPhone ? "pcPath" : "mobilePath",
			isJumped = false;

		pcMobileChange.forEach(function(oneChange) {
			if(oneChange[nowKey] == nowPath) {
				switch(oneChange.type) {
					case 1:
						Router.replace({path: oneChange[jumpKey], query: to.query});
            next && next()
						break;
					case 2:
						oneChange.changeFunc(Router, oneChange[jumpKey], to, next);
						break;
				}

				isJumped = true;
			}
		});
	}

	return isJumped;
}

/**
 * 设置移动端rem
 */
baseTpl.prototype.setMobileRem = function(to) {
	var nowPage = to.matched && to.matched.length && to.matched[0];
	if(!nowPage) return false;

	window.removeEventListener('resize', this.changSize);
	this.setClientClass(!!to.meta.isMobile);

	if(to.meta.isMobile) {
		this.changSize(to);
		window.addEventListener('resize', this.changSize, false);
	} else {
		document.documentElement.style.fontSize = '';
	}
}


/**
 * 监听页面变动更改rem方法
 */
baseTpl.prototype.changSize = function(to) {
	var clientWidth = document.documentElement.clientWidth;

	clientWidth = clientWidth <= appConfig.mobileMaxWidth ? clientWidth : 480;
	clientWidth = clientWidth >= 320 ? clientWidth : 320;
	document.documentElement.style.fontSize = 100 * clientWidth / 375 + 'px';
	
	if(clientWidth >= appConfig.mobileMaxWidth) {
		document.body.style.width = clientWidth+'px';
	}
}

/**
 * 初始化模板
 * @return {[type]} [description]
 */
baseTpl.prototype.init = function() {

	var Router = this.loadRouter();
	this.beforeEnterModule(Router);

	Vue.appRouter = Vue.prototype.appRouter = Router;
	return Router;
};

export default baseTpl;
