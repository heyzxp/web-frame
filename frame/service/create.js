/**
 * 生成配置文件
 */
const path = require("path");
const child_process = require("child_process");
const ejs = require("ejs");
const fs = require("fs");
const logger = require("./log.js");
// const axios = require("axios");
	
module.exports = {
	//环境id
	webId: '',

	//输出目录
	outDir: '',

	//模板目录
	templateDir: '',

	//全局配置目录
	appConfigDir: '',

	//核心目录
	coreDir: '',

	// 页面目录
	pagesDir: '',

	// 组件目录
	componentsDir: '',

	//定制目录
	evnsDir: '',

	//evns config 目录
	evnsConfigDir: '',

	//vuex目录
	storeDir: '',

	//合并代码后的目录
	mergeDir: '',

	//静态文件目录
	staticDir: '',

	//项目根目录
	appBaseDir: '',

	//主配置
	appConfig: {},

	//主配置
	config: {
    /**
     * 页面版本
     * @type {String}
     */
    pageVersion: '1',
  },

	//路径配置
	pathConfig: [],

	//路由配置
	routerConfig: {},

	//接口配置
	apiConfig: {},

	//vuex配置
	storeConfig: [],

	//使用模块所在的目录
	modulesDirs: {},

	//scss配置
	scssConfig: [],

	//目录别名列表
	aliasConfig: [],

	//pc端和移动端互跳配置
	pcmobileConfig: [],

	/**
	 * 初始化方法
	 * @param  {[type]} config_str [description]
	 * @return {[type]}       [description]
	 */
	init(config_str) {
		this.resolve_config_str(config_str);
		this.setDir();
		this.getMainConfig();
		this.getConfigDir();
		this.otherConfig();	

		if(fs.existsSync(this.outDir)) {
			if (process.platform == "win32") {
				child_process.execSync("rd /s/q "+this.outDir);
			} else {
				child_process.execSync("rm -rf "+this.outDir);
			}
		}
		fs.mkdirSync(this.outDir);

		this.createRouter();
		this.createPrintRouter();
		this.createApi();
		this.createStore();
		this.createScss();
		this.createAlias();
		this.createPcMobile();
		this.createLang();
		this.createAppConfig();
		this.createEnvConfig();

		let allModuleInfo = this.createDirMap();
		this.createMergeDir(allModuleInfo.allModulesDirs);
		this.createMergeFiles(allModuleInfo.allModuleFiles);

		//创建成功标识方法，标识当前初始化以成功，可以开始监听
		this.createSuccessFile();
	},

	/**
	 * watch获取初始化对象
	 * @param  {[type]} config_str [description]
	 * @return {[type]}       [description]
	 */
	watchInit(config_str) {
		this.init(config_str)
		this.resolve_config_str(config_str);
		this.setDir();
	},

	/**
	 * 解析配置字符串
	 * @param {string} config_str 
	 */
	resolve_config_str(config_str) {
		let config_arr = config_str.split("-");

		let now_config = {
					webId: config_arr[0] ? config_arr[0] : 'default',
					version: config_arr[1] ? config_arr[1] : '1.0',
					env: config_arr[2] ? config_arr[2] : 'product'
				};
		
		this.config = { ...this.config, ...now_config};
		this.webId = this.config.webId;
	},

	/**
	 * watch监听简历成功之后
	 */
	watchInitAfter() {
		this.getMainConfig();
		this.getConfigDir();
		this.otherConfig();	
	},

	/**
	 * 生成环境变量
	 */
	createEnvConfig() {
		let VUE_APP_API_BASE = '',
				VUE_APP_PATH = '/v2/';
		
		if(['neutest'].includes(this.webId)) {
			VUE_APP_API_BASE = '/service';
			VUE_APP_PATH = '/service/v2/';
		}

		ejs.renderFile(this.getResolve(this.templateDir, '.env'), {
			VUE_APP_API_BASE: VUE_APP_API_BASE,
			VUE_APP_PATH: VUE_APP_PATH
		}, (err, data) => {
			if(err) {
				logger.error('生成环境变量失败'+err);
			}

			fs.writeFileSync(path.resolve(this.appBaseDir, '.env'), data);
		})
	},

	/**
	 * 创建目录合并图谱
	 * @return {[type]} [description]
	 */
	createDirMap() {
		let allModulesDirs = {},
			allModuleFiles = {};

		for(let mName in this.modulesDirs) {
			let oneModulesDirs = this.modulesDirs[mName],
				oneModuleDirMap = {},
				oneModuleFiles = {};

			oneModulesDirs.forEach((modulePath) => {
				let nowMap = this.getFileByPath(mName, modulePath);

				oneModuleDirMap = this.toMergeDirs(oneModuleDirMap, nowMap.dirMap);
				oneModuleFiles = this.toMergeFiles(oneModuleFiles, nowMap.allFiles);
			});

			allModulesDirs[mName] = oneModuleDirMap;
			allModuleFiles[mName] = oneModuleFiles;
		}

		ejs.renderFile(this.getResolve(this.templateDir, 'map.js'), {
			allModuleFiles: allModuleFiles
		}, (err, data) => {
			if(err) {
				logger.error('生成项目整体配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'map.js'), data);
		});		

		return {
			allModulesDirs,
			allModuleFiles
		};
	},

	/**
	 * 创建合并目录
	 * @param  {[type]} mergeDirs [description]
	 * @return {[type]}           [description]
	 */
	createMergeDir(mergeDirs) {
		if(fs.existsSync(this.mergeDir)) {
			if (process.platform == "win32") {
				child_process.execSync("rd /s/q "+this.mergeDir);
			} else {
				child_process.execSync("rm -rf "+this.mergeDir);
			}
		}
		fs.mkdirSync(this.mergeDir);

		//创建目录
		let _this = this;
		function createDir(path, dirs) {
			for(let dirName in dirs) {
				fs.mkdirSync(_this.mergeDir+path+'/'+dirName);

				if(Object.keys(dirs[dirName]).length) {
					createDir(path+'/'+dirName, dirs[dirName]);
				}
			}
		}

		createDir('', mergeDirs);
	},

	/**
	 * 创建文件软连接
	 * @param  {[type]} mergeFiles [description]
	 * @return {[type]}            [description]
	 */
	createMergeFiles(mergeFiles) {
		for(let mName in mergeFiles) {
			let moduleFiles = mergeFiles[mName];
			
			for(let newPath in moduleFiles) {
				fs.writeFileSync(this.mergeDir+'/'+mName+'/'+newPath, fs.readFileSync(moduleFiles[newPath]));
			}
		}
	},

	/**
	 * 合并多级文件
	 * @param  {[type]} allFiles [description]
	 * @param  {[type]} files    [description]
	 * @return {[type]}          [description]
	 */
	toMergeFiles(allFiles, files) {
		files.forEach((file) => {
			allFiles[file.path] = file.rightPath;
		})

		return allFiles;
	},

	/**
	 * 多级目录结构合并
	 * @param  {[type]} allDirs [已经合并的目录结构]
	 * @param  {[type]} dirs    [要执行合并的目录结构]
	 * @return {[type]}         [description]
	 */
	toMergeDirs(allDirs, dirs) {
		//合并目录
		function addDirs(nowDir, nowDirs) {
			for(let dirName in nowDirs) {
				if(!nowDir[dirName]) {
					nowDir[dirName] = {}
				}

				let dirChildren = nowDirs[dirName];
				if(Object.keys(dirChildren).length) {
					addDirs(nowDir[dirName], dirChildren);	
				}
			}				
		}
		addDirs(allDirs, dirs);

		return allDirs;
	},

	/**
	 * 获取指定目录下所有的文件和文件夹
	 * @param  {[type]} mName [模块名称]
	 * @param  {[type]} path [路径]
	 * @return {[type]}      [description]
	 */
	getFileByPath(mName, mpath) {
		let dirMap = {},
			allFiles = [];

		//添加目录
		function addDir(nowPath) {
			let pathArr = nowPath.replace(mpath+path.sep, '').split(path.sep),
				nowDir = null;
			
			pathArr.forEach((name, index) => {
				if(index == 0) {
					if(!dirMap[name]) {
						dirMap[name] = {};
					}

					nowDir = dirMap[name];					
				} else {
					if(!nowDir[name]) {
						nowDir[name] = {};
					}

					nowDir = nowDir[name];					
				}
			})
		}

		//遍历获取目录结构
		function getFiles(nowPath) {
			let files = fs.readdirSync(nowPath, {withFileTypes: true});

			files.forEach((file) => {
				let filePath = path.resolve(nowPath, file.name);

				if(file.isDirectory()) {
					addDir(filePath);
					getFiles(filePath);
				} else {
					if(file.name != '.DS_Store') {
						allFiles.push({
							path: filePath.replace(mpath+path.sep,  ''),
							rightPath: filePath
						});						
					}
				}
			})			
		}

		getFiles(mpath);

		return {
			dirMap,
			allFiles
		};
	},

	/**
	 * 获取当前环境主配置
	 * @return {[type]} [description]
	 */
	getMainConfig() {
		let isSetSelf = fs.existsSync(path.resolve(this.evnsConfigDir, this.webId+"/app.config.js")),
				self_config = this.requireFile(this.evnsConfigDir, (isSetSelf ? this.webId : 'default') +"/app.config.js");

		this.config = {...this.config, ...self_config, ...{envWebId: this.webId}};
		this.appConfig = this.requireFile(this.appConfigDir, 'appConfig.js');
	},

	/**
	 * 根据当前环境获取目录列表
	 * @return {[type]} [description]
	 */
	getConfigDir() {
		//核心代码目录
		this.pathConfig.push(this.coreDir);

		//如果存在定制，则合并定制目录
		let evnsPath = path.resolve(this.evnsDir, this.config.webId);

		if(fs.existsSync(evnsPath)) {
			this.pathConfig.push(this.getResolve(this.evnsDir, this.config.webId));
		}

	},

	/**
	 * 获取其他配置，路由、接口、vuex
	 * @return {[type]} [description]
	 */
	otherConfig() {
		let allRouterConfig = {},
				allApiConfig = {},
				allStoreConfig = [],
				allPcmobileConfig = {};
				allModulesDirs = {};

    for (let mName of [...this.config.modules, 'zl']) {
      let routerConfig = {},
				apiConfig = {},
				hasStore = false,
				pcmobileConfig = {},
				modulesDirs = [];

			for (const device of [ 'pages', 'components' ]) {
				let	mNamePath = device+ '/' + mName;
				
				for (let onePath of this.pathConfig) {
	
					if(fs.existsSync(path.resolve(onePath, mNamePath))) {
						if(fs.existsSync(path.resolve(onePath, mNamePath+'/config/main.config.js'))) {
							let mainConfig = this.requireFile(onePath, mNamePath+'/config/main.config.js');
							
							if(mainConfig.pages) routerConfig = {...routerConfig, ...mainConfig.pages};
							if(mainConfig.apis) apiConfig = {...apiConfig, ...mainConfig.apis};							
						}
						
						if(fs.existsSync(path.resolve(onePath, mNamePath+'/store/index.js'))) hasStore = true;
						if(fs.existsSync(path.resolve(onePath, mNamePath+'/config/pcmobile.config.js'))) {
							let nowPcmobileConfig = this.requireFile(onePath, mNamePath+'/config/pcmobile.config.js');
	
							pcmobileConfig = {...pcmobileConfig, ...this.changePcmobileToObject(nowPcmobileConfig)};
						}
						
						modulesDirs.push(path.resolve(onePath, mNamePath));					
					}
				}
				
				allModulesDirs[mName] = modulesDirs;
				allRouterConfig[mName] = routerConfig;
				allApiConfig = {...allApiConfig, ...apiConfig};
				allPcmobileConfig = {...allPcmobileConfig, ...pcmobileConfig};
				if(hasStore) allStoreConfig.push({name: mName, path: '../merge/'+mNamePath+'/store/index.js'});
			}
    }

		console.log(allModulesDirs)

    for (let key in allRouterConfig) {
      for (let pageKey in allRouterConfig[key]) {
        if (typeof allRouterConfig[key][pageKey] == 'function') {
          allRouterConfig[key][pageKey] = allRouterConfig[key][pageKey]()[this.config.pageVersion]
        }
      }
    }

		this.routerConfig = allRouterConfig;
		this.apiConfig = allApiConfig;
		this.storeConfig = allStoreConfig;
		this.pcmobileConfig = this.changePcmobileToArray(allPcmobileConfig);
		this.modulesDirs = allModulesDirs;
	},
	
	/**
	 * 转换pcmobileConfig代码为对象格式
	 * @param {配置} configs
	 */
	changePcmobileToObject(configs) {
		let newConfig = {};

		configs.forEach((config) => {
			newConfig[config.pcPath+config.mobilePath] = config;
		})

		return newConfig;
	},

	/**
	 * 转化pcmobile配置为数组
	 * @param {配置} configs 
	 */
	changePcmobileToArray(configs) {
		let newConfigs = [];

		for(let key in configs) {
			newConfigs.push(configs[key]);
		}

		return newConfigs;
	},

	/**
	 * 生成路由配置
	 * @return {[type]} [description]
	 */
	createRouter() {
		for(var mname in this.routerConfig) {
			for(var pname in this.routerConfig[mname]) {
				if(!this.routerConfig[mname][pname].notNeedLogin) {
					this.routerConfig[mname][pname].notNeedLogin = false;
				}

				//填充指定路由是否对访客模式生效
				if(!this.routerConfig[mname][pname].guestMode) {
					this.routerConfig[mname][pname].guestMode = false;
				}

				if(!this.routerConfig[mname][pname].loadedApis) {
					this.routerConfig[mname][pname].loadedApis = [];
				}

				this.routerConfig[mname][pname].loadedApis = JSON.stringify(this.routerConfig[mname][pname].loadedApis);

				if(!this.routerConfig[mname][pname].loadedApiParams) {
					this.routerConfig[mname][pname].loadedApiParams = {};
				}

				this.routerConfig[mname][pname].loadedApiParams = JSON.stringify(this.routerConfig[mname][pname].loadedApiParams);
			
				if(!this.routerConfig[mname][pname].isMobile) {
					this.routerConfig[mname][pname].isMobile = false;
				}

				if(!this.routerConfig[mname][pname].isBackstage) {
					this.routerConfig[mname][pname].isBackstage = false;
				}
			}
		}

		ejs.renderFile(this.getResolve(this.templateDir, 'router.config.js'), {
			routerConfig: this.routerConfig
		}, (err, data) => {
			if(err) {
				logger.error('生成路由配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'router.config.js'), data);
		});
	},

	/**
	 * 生成打印路由
	 */
	createPrintRouter() {
		let routerConfig = {};

		for(var mname in this.routerConfig) {
			for(var pname in this.routerConfig[mname]) {
				if(mname == 'matter' && pname == 'qrcode') {
					routerConfig = {
						cloudprintself: {
							qrcode: {
								...this.routerConfig[mname][pname], 
								...{selfModule: mname},
								...{
									isIndexPage: true
								}
							}
						}
					}
				}
			}
		}
		
		ejs.renderFile(this.getResolve(this.templateDir, 'printrouter.config.js'), {
			routerConfig: routerConfig
		}, (err, data) => {
			if(err) {
				logger.error('生成路由配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'printrouter.config.js'), data);
		});
	},

	/**
	 * 生成接口配置
	 * @return {[type]} [description]
	 */
	createApi() {
		ejs.renderFile(this.getResolve(this.templateDir, 'apilist.config.js'), {
			apiConfig: this.apiConfig
		}, (err, data) => {
			if(err) {
				logger.error('生成接口列表配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'apilist.config.js'), data);
		})		
	},

	/**
	 * 生成vuex配置
	 * @return {[type]} [description]
	 */
	createStore() {
		ejs.renderFile(this.getResolve(this.templateDir, 'store.config.js'), {
			storeConfig: this.storeConfig
		}, (err, data) => {
			if(err) {
				logger.error('生成vuex配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'store.config.js'), data);
		})		
	},

	/**
	 * 创建scss基础引入配置
	 * @return {[type]} [description]
	 */
	createScss() {
		let nowVar = fs.existsSync(path.resolve(this.evnsConfigDir, this.config.webId+'/var.scss')) ? this.config.webId : 'default';

		ejs.renderFile(this.getResolve(this.templateDir, 'scss.config.js'), {
			webId: nowVar,
			mobileMaxWidth: this.appConfig.mobileMaxWidth,
			pcMinWidth: this.appConfig.mobileMaxWidth + 1,
		}, (err, data) => {
			if(err) {
				logger.error('生成scss配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'scss.config.js'), data);
		})		
	},

	/**
	 * 创建别名列表，方便模块引入基础库
	 * @return {[type]} [description]
	 */
	createAlias() {
		let aliasArr = {};
		
		aliasArr['@static'] = this.staticDir.replace(/\\/g, '\\\\');
		this.config.modules.forEach((mName) => {
			let nowPath = path.resolve(this.mergeDir, mName);

			aliasArr['@'+mName] = nowPath.replace(/\\/g, '\\\\');
		});

		ejs.renderFile(this.getResolve(this.templateDir, 'alias.config.js'), {
			aliasArr: aliasArr
		}, (err, data) => {
			if(err) {
				logger.error('生成别名配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'alias.config.js'), data);
		});		
	},

	/**
	 * 创建pcmobile配置
	 */
	createPcMobile() {
		ejs.renderFile(this.getResolve(this.templateDir, 'pcmobile.config.js'), {
			configs: this.pcmobileConfig
		}, (err, data) => {
			if(err) {
				logger.error('生成pcmobile配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'pcmobile.config.js'), data);
		});
	},

	/**
	 * 创建语言包配置
	 * @return {[type]} [description]
	 */
	createLang() {
		let nowZhVar = fs.existsSync(path.resolve(this.evnsConfigDir, this.config.webId+'/lang.zh.config.js')) ? this.config.webId : 'default';
		let nowEnVar = fs.existsSync(path.resolve(this.evnsConfigDir, this.config.webId+'/lang.en.config.js')) ? this.config.webId : 'default';

		ejs.renderFile(this.getResolve(this.templateDir, 'lang.config.js'), {
			nowZhVar: nowZhVar,
			nowEnVar: nowEnVar
		}, (err, data) => {
			if(err) {
				logger.error('生成语言包配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'lang.config.js'), data);
		});		
	},

	/**
	 * 创建项目配置
	 * @return {[type]} [description]
	 */
	createAppConfig() {
		let keys = ['webId', 'envWebId', 'login', 'logout', 'userKeyPrefix', 'onlyClient'],
				webId = this.config['webId'] ? this.config['webId'] : 'default';

		keys.forEach((kvalue) => {
			switch(kvalue) {
				case 'webId':
					this.config[kvalue] = webId;

					break;
				case 'envWebId':
					this.config[kvalue] = this.config[kvalue] ? this.config[kvalue] : webId;
					
					break;
				default:
					this.config[kvalue] = this.config[kvalue] ? this.config[kvalue] : '';

					break;
			}
		});

		let sourceV = (new Date()).getTime();
		ejs.renderFile(this.getResolve(this.templateDir, 'app.config.js'), {
			config: this.config,
			sourceV: sourceV,
		}, (err, data) => {
			if(err) {
				logger.error('生成项目整体配置失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.outDir, 'app.config.js'), data);
		});
		
		ejs.renderFile(this.getResolve(this.templateDir, 'version.js'), {
			sourceV: sourceV,
		}, (err, data) => {
			if(err) {
				logger.error('生成版本记录文件失败：'+err);
			}

			fs.writeFileSync(path.resolve(this.staticDir, 'version.js'), data);
		});
	},

	/**
	 * 创建成功标识方法
	 */
	createSuccessFile() {
		fs.writeFileSync(path.resolve(this.outDir, 'success.js'), 'success');
	},

	/**
	 * 判断初始化是否成功
	 */
	hasInitSuccess() {
		if(fs.existsSync(path.resolve(this.outDir, 'success.js'))) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * 设置各模块目录
	 */
	setDir() {
		this.outDir = path.resolve(__dirname, '../../src/createConfig');
		this.templateDir = path.resolve(__dirname, './ejs');
		this.appConfigDir = path.resolve(__dirname, '../../src/config/base');
		this.evnsConfigDir = path.resolve(__dirname, '../../src/config/evns');
		this.coreDir = path.resolve(__dirname, '../../src/core');
		this.pagesDir = path.resolve(__dirname, '../../src/core/pages');
		this.componentsDir = path.resolve(__dirname, '../../src/core/components');
		this.evnsDir = path.resolve(__dirname, '../../src/evns');
		this.storeDir = path.resolve(__dirname, '../../src/store');
		this.mergeDir = path.resolve(__dirname, '../../src/merge');
		this.staticDir = path.resolve(__dirname, '../../static');
		this.appBaseDir = path.resolve(__dirname, '../../');
	},

	/**
	 * 获取版本数值
	 * @param  {[type]} version [版本号]
	 * @return {[type]}         [description]
	 */
	getVersionNum(version) {
		version = version.split(".");

		return parseInt(version[0]+''+version[1]+version[2]);
	},

	/**
	 * 获取主版本值
	 * @param  {[type]} version [版本号]
	 * @return {[type]}         [description]
	 */
	getMainVersion(version) {
		version = version.split(".");

		return parseInt(version[0]);
	},

	/**
	 * 同步引入文件
	 * @param  {[type]} dir1 [路径1]
	 * @param  {[type]} dir2 [路径2]
	 * @return {[type]}      [description]
	 */
	requireFile(dir1, dir2) {
		delete require.cache[require.resolve(this.getResolve(dir1, dir2))]
		return require(this.getResolve(dir1, dir2));
	},

	/**
	 * 读取文件
	 * @param  {[type]} dir1 [description]
	 * @param  {[type]} dir2 [description]
	 * @return {[type]}      [description]
	 */
	readFile(dir1, dir2) {
		return fs.readFileSync(this.getResolve(dir1, dir2));
	},

	/**
	 * 获取文件路径
	 * @param  {[type]} dir1 [description]
	 * @param  {[type]} dir2 [description]
	 * @return {[type]}      [description]
	 */
	getResolve(dir1, dir2) {
		let filePath = path.resolve(dir1, dir2);

		if(!fs.existsSync(filePath)) {
			logger.error("文件："+filePath+' 不存在');
		}

		return filePath;		
	}				
};








































