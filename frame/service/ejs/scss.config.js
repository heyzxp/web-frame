/**
 * scss config
 */

module.exports = {    
    scss: {
        prependData: `
        @import "~@/config/evns/<%=webId%>/var.scss";
        @import "~@/scss/scss.common.scss";
        $mobile_max_width: <%=mobileMaxWidth%>px;
        $pc_min_width: <%=pcMinWidth%>px;`
    }
}



