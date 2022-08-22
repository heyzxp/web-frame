/**
 * 接口列表
 */

module.exports = {
	<%_ for(var name in apiConfig) { _%>
	'<%=name%>': '<%=apiConfig[name]%>',
	<%_ } _%>
}