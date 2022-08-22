/**
 * 框架服务调用
 */
const logger = require("./log.js");
const configArgvs = require("./params.js").getParams();
const create = require("./create.js");
const watch = require("./watch.js");

if(configArgvs.webid) {
	switch(configArgvs.type) {
		case 'create':
			create.init(configArgvs.webid);
			break;
		case 'watch':
			watch.init(configArgvs.webid);

			break;
	}
	
} else {
	logger.error("命令行格式错误，请传入webId，如：npm run dev --webid=default");
}































