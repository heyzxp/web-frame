// vuex 入口文件

import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

<%_ for(var index in storeConfig) { _%>
import <%=storeConfig[index].name%>Module from "<%=storeConfig[index].path%>";
<%_ } _%>

//实例化vuex
const appStore = new Vuex.Store({
	modules: {
    <%_ for(var index in storeConfig) { _%>
    <%=storeConfig[index].name%>: <%=storeConfig[index].name%>Module,
    <%_ } _%>
	}
});

//热加载模块
if (module.hot) {
  module.hot.accept([
    <%_ for(var index in storeConfig) { _%>
    '<%=storeConfig[index].path%>',
    <%_ } _%>
  ], () => {
    <%_ for(var index in storeConfig) { _%>
    const new<%=storeConfig[index].name%>Module = require('<%=storeConfig[index].path%>').default;
    <%_ } _%>

    // 加载新模块
    appStore.hotUpdate({
      modules: {
        <%_ for(var index in storeConfig) { _%>
        <%=storeConfig[index].name%>: new<%=storeConfig[index].name%>Module,
        <%_ } _%>
      }
    });

  })
}

export default appStore;