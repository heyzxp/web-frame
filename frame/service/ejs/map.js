/**
 * 各模块下对应页面map
 */

<%_ for(let mName in allModuleFiles) { _%>
	<%_ for(let nowPath in allModuleFiles[mName]) { _%>
'<%=mName%>/<%=nowPath%>' => '<%=allModuleFiles[mName][nowPath]%>';
	<%_ } _%>
<%_ } _%>