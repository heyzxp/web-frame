/**
 * ajax 空闲后执行指定方法
 */

const freeAjaxHelper = {
  setAjaxNumKey: 0,
  setFreeAjax: [],
};

/**
 * 初始化
 */
freeAjaxHelper.init = function() {
  this.setAjaxNumKey = 0;
  this.setFreeAjax = [];
}

/**
 * 添加数值
 */
freeAjaxHelper.add = function() {
  this.setAjaxNumKey++;
}

/**
 * 减少数值
 */
freeAjaxHelper.reduce = function() {
  //当前为1，200毫秒后为0，可以请求空闲ajax，防止连续ajax没有加载完成
  if(this.setAjaxNumKey == 1) {
    setTimeout(() => {
      if(this.setAjaxNumKey == 0) {
        this.todoFreeAjx();
      }
    }, 200);
  }

  if(this.setAjaxNumKey > 0) {
    this.setAjaxNumKey--;
  }
}

/**
 * 添加ajax空闲后执行ajax
 * @param {*} func 
 */
freeAjaxHelper.addFreeAjax = function (func) {
  this.setFreeAjax.push(func);
}

/**
 * 空闲执行ajax
 */
freeAjaxHelper.todoFreeAjx = function() {
  this.setFreeAjax.forEach((oneFunc) => {
    oneFunc();
  });

  this.init();
}

export default freeAjaxHelper