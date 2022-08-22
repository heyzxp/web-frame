/**
 * 框架服务调用
 */
const logger = require("./log.js");
const configArgvs = require("./params.js").getParams();
const chokidar = require('chokidar');
const path = require("path");
const fs = require("fs");
const creater = require("./create.js");
const child_process = require("child_process");

module.exports = {
  watcher: null,
  ready: false,

  mergeConfigDir: '',
  watchFilesConfig: '',
  watchFiles: [],
  mergeDirsConfig: '',
  mergeDirs: {},
  mergeFilesConfig: '',
  mergeFiles: {},


  /**
   * 初始化
   * @return {[type]} [description]
   */
  init(webId) {
    creater.watchInit(webId);

    let _this = this;
    function startWatch() {
      if(creater.hasInitSuccess()) {
        creater.watchInitAfter();
        _this.getConfig();
        _this.initWatch();
      } else {
        setTimeout(() => {
          startWatch();
        }, 200);
      }
    }

    setTimeout(() => {
      startWatch();
    }, 200);
  },

  /**
   * 获取配置
   * @return {[type]} [description]
   */
  getConfig() {
    let allMoules = creater.createDirMap();
    this.watchFilesConfig = creater.modulesDirs;
    this.mergeFilesConfig = allMoules.allModuleFiles;
    this.mergeDirsConfig = allMoules.allModulesDirs;

    this.setWatchFile(this.watchFilesConfig);
    this.setMergeFiles(this.mergeFilesConfig);
  },

  /**
   * 刷新配置
   * @return {[type]} [description]
   */
  refreshConfig(allMoules) {
    this.mergeFilesConfig = allMoules.allModuleFiles;
    this.mergeDirsConfig = allMoules.allModulesDirs;    
  },

  /**
   * 设置监听目录
   * @param {[type]} watchFilesConfig [description]
   */
  setWatchFile(watchFilesConfig) {
    let watchFiles = [];

    for(let mName in watchFilesConfig) {
      watchFiles = [...watchFiles, ...watchFilesConfig[mName]];
    }

    this.watchFiles = watchFiles;     
  },

  /**
   * 获取merge的文件列表
   * @param {[type]} mergeFilesConfig [description]
   */
  setMergeFiles(mergeFilesConfig) {
    let mergeFiles = {};

    for(let mName in mergeFilesConfig) {
      for(let filePath in mergeFilesConfig[mName]) {
        mergeFiles[mergeFilesConfig[mName][filePath]] = {
          mName: mName,
          path: filePath
        };
      }
    }
    this.mergeFiles = mergeFiles;    
  },

  /**
   * 初始化监听
   * @return {[type]} [description]
   */
  initWatch() {
    this.watcher = chokidar.watch(this.watchFiles);
    this.watcher
      .on('add', (nowPath) => {if(this.ready) this.addFile(nowPath)})
      .on('addDir', (nowPath) => {if(this.ready) this.addDirecotry(nowPath)})
      .on('change', (nowPath) => {if(this.ready) this.fileChange(nowPath)})
      .on('unlink', (nowPath) => {if(this.ready) this.fileRemoved(nowPath)})
      .on('unlinkDir', (nowPath) => {if(this.ready) this.directoryRemoved(nowPath)})
      .on('error', (error) => {
        console.log('Error happened', error);
      })
      .on('ready', () => {
        console.log('Initial scan complete. Ready for changes.');
        this.ready = true;
      })
      .on('error', (error) => {
        console.log(error)
      });    
  },

  /**
   * 添加文件时
   * @param {[type]} path [description]
   */
  addFile(nowPath) {
    let allMoules = creater.createDirMap();
    this.setMergeFiles(allMoules.allModuleFiles);
    this.refreshConfig(allMoules);

    if(this.mergeFiles[nowPath]) {
      fs.writeFileSync(
        path.resolve(creater.mergeDir, this.mergeFiles[nowPath].mName+'/'+this.mergeFiles[nowPath].path),
        creater.readFile(nowPath, '')
      );

      logger.success('file added');      
    }
  },

  /**
   * 删除文件时
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  fileRemoved(nowPath) {
    if(this.mergeFiles[nowPath]) {
      let mergePath = path.resolve(creater.mergeDir, this.mergeFiles[nowPath].mName+'/'+this.mergeFiles[nowPath].path);

      if(fs.existsSync(mergePath)) fs.unlinkSync(mergePath);

      let allMoules = creater.createDirMap();
      this.setMergeFiles(allMoules.allModuleFiles);
      this.refreshConfig(allMoules);

      logger.success("file deleted");
    }
  },

  /**
   * 文件内容变动时
   * @return {[type]}      [description]
   */
  fileChange(nowPath) {
    if(this.mergeFiles[nowPath]) {
      fs.writeFileSync(
        creater.getResolve(
          creater.mergeDir, this.mergeFiles[nowPath].mName+'/'+this.mergeFiles[nowPath].path
        ),

        creater.readFile(nowPath, '')
      );

      if(nowPath.indexOf('main.config.js') !== -1) {
        creater.otherConfig();
        creater.createRouter();
        creater.createApi();        
      }
      
      if(nowPath.indexOf('pcmobile.config.js') !== -1) {
        creater.otherConfig();
        creater.createPcMobile();      
      }

      logger.success("file changed");
    }
  },

  /**
   * 添加目录时
   * 1、根据最新获取到的目录结构，判断其中的目录节点是否存在，不存在就创建
   * 2、如果合并的文件有当前目录的文件，则在merge目录中进行重建
   * @param {[type]} path [description]
   */
  addDirecotry(nowPath) {
    let allMoules = creater.createDirMap(),
        _this = this;

    //创建目录
    function createDir(thepath, dirs) {
      for(let dirName in dirs) {
        if(!fs.existsSync(creater.mergeDir+thepath+path.sep+dirName)) {
          fs.mkdirSync(creater.mergeDir+thepath+path.sep+dirName);
        }

        if(Object.keys(dirs[dirName]).length) {
          createDir(thepath+path.sep+dirName, dirs[dirName]);
        }
      }
    }
    createDir('', allMoules.allModulesDirs);

    //创建文件
    for(let mName in allMoules.allModuleFiles) {
      let moduleFiles = allMoules.allModuleFiles[mName];
      
      for(let newPath in moduleFiles) {
        if(moduleFiles[newPath].indexOf(nowPath) !== -1) {
          fs.writeFileSync(creater.mergeDir+path.sep+mName+path.sep+newPath, fs.readFileSync(moduleFiles[newPath]));
        }
      }
    }
    this.setMergeFiles(allMoules.allModuleFiles);
    this.refreshConfig(allMoules);

    logger.success('create direcotry');
  },  

  /**
   * 删除文件夹时
   * 1、判断当前删除的目录，在最新的合并信息中是否存在，如果不存在，直接删除merge中的对应文件夹
   * 2、如果存在，则对比在应该写到该meger目录下的新旧merge file，删除或者重写文件
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  directoryRemoved(nowPath) {
    let allMoules = creater.createDirMap(),
        clearPath = '',
        _this = this;

    //获取纯净相对目录
    this.watchFiles.forEach((file) => {
      if(nowPath.indexOf(file) !== -1) {
        let fileSplit = file.split(path.sep);

        clearPath = fileSplit[fileSplit.length - 1]+nowPath.replace(file, '');
      }
    });

    //判断是否还在合并目录中存在
    let clearPathArr = clearPath.split(path.sep),
        nowDir = null,
        hasDir = true;

    clearPathArr.forEach((pathOne, index) => {
      if(!hasDir) return false;

      if(index == 0) {
        if(allMoules.allModulesDirs[pathOne]) {
          nowDir = allMoules.allModulesDirs[pathOne];
        } else {
          hasDir = false;
        }
      } else {
        if(nowDir[pathOne]) {
          nowDir = nowDir[pathOne];
        } else {
          hasDir = false;
        }        
      }
    })

    //不存在就删除merge中的目录，存在就刷新目录和目录下文件
    if(hasDir) {
      //刷新目录
      function createDir(thepath, dirs) {
        for(let dirName in dirs) {
          if(!fs.existsSync(creater.mergeDir+thepath+path.sep+dirName)) {
            fs.mkdirSync(creater.mergeDir+thepath+path.sep+dirName);
          }

          if(Object.keys(dirs[dirName]).length) {
            createDir(thepath+path.sep+dirName, dirs[dirName]);
          }
        }
      }
      createDir('', allMoules.allModulesDirs);      

      //刷新目录下变动文件
      let mName = clearPath.split(path.sep)[0],
          rPath = clearPath.replace(mName+path.sep, ''),
          newModuleFiles = allMoules.allModuleFiles[mName],
          oldModuleFiles = this.mergeFilesConfig[mName],
          newFiles = {},
          oldFiles = {};

      for(let mpath in newModuleFiles) {
        if(mpath.indexOf(rPath) !== -1) {
          newFiles[mpath] = newModuleFiles[mpath]
        }
      }

      for(let mpath in oldModuleFiles) {
        if(mpath.indexOf(rPath) !== -1) {
          oldFiles[mpath] = oldModuleFiles[mpath]
        }
      }

      //如果新文件列表中文件存且目录结构不一样或者文件不存在则重写文件，如果目录结构没变则不变动，其余多余的缓存文件，不再逐级删除
      for(let mpath in newFiles) {
        let needWrite = false;
        if(oldFiles[mpath]) {
          if(oldFiles[mpath] !== newFiles[mpath]) {
            needWrite = true;
          }
        } else {
          needWrite = true;
        }

        fs.writeFileSync(creater.mergeDir+path.sep+mName+path.sep+mpath, fs.readFileSync(newFiles[mpath]));
      }      
      
    } else {
      if (process.platform == "win32") {
        child_process.execSync("rd /s/q "+path.resolve(creater.mergeDir, clearPath));
      } else {
        child_process.execSync("rm -rf "+path.resolve(creater.mergeDir, clearPath));
      }
    }

    logger.success("directory removed");
  },    
}
















