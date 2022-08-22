/**
 * pc和手机端互相跳转
 */

module.exports = [
  <%_ for(let key in configs) { _%>
  {
    name: '<%=configs[key].name%>',
    type: <%=configs[key].type%>,
    pcPath: '<%-configs[key].pcPath%>',
    mobilePath: '<%-configs[key].mobilePath%>',
    <%_ if(configs[key].changeFunc) { _%>
    changeFunc: <%-configs[key].changeFunc%>
    <%_ } _%>
  },
  <%_ } _%>
];