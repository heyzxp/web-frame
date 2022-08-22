/**
 * 获取参数
 */

module.exports = {
	/**
	 * 获取参数
	 * @return {[type]} [description]
	 */
	getParams() {
		let argvs = process.argv,
				configs = ['webid', 'type'],
				configArgvs = {};
			
		argvs.forEach((vaule, index) => {
			if(vaule.indexOf("=") !== 0) {
				let vauleArr = vaule.split("=");

				configArgvs[vauleArr[0].replace(/-/g, '')] = vauleArr[1];
			}
		})

		configs.forEach((configName) => {
			if(process.env['npm_config_'+configName]) {
				configArgvs[configName] = process.env['npm_config_'+configName];
			}
		})

		return configArgvs;
	}
}