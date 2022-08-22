/**
 * 别名配置
 */

module.exports = {
	<%_ for(var name in aliasArr) { _%>
	'<%=name%>': '<%=aliasArr[name]%>',
	<%_ } _%>
}