/**
 * 设置语言包
 */
import Vue from 'vue';
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

import enLocale from 'element-ui/lib/locale/lang/en';
import zhLocale from 'element-ui/lib/locale/lang/zh-CN';
import ElementLocale from 'element-ui/lib/locale';
import defaultZhLang from '../config/evns/default/lang.zh.config';
import zhLang from '../config/evns/<%=nowZhVar%>/lang.zh.config';
import defaultEnLang from '../config/evns/default/lang.en.config';
import enLang from '../config/evns/<%=nowEnVar%>/lang.en.config';

const messages = {
  en: {
    ...enLocale,
    system: {...defaultEnLang, ...enLang}
  },
  zh: {
    ...zhLocale,
    system: {...defaultZhLang, ...zhLang}
  }
};

const i18n = new VueI18n({
  locale: window.localStorage.getItem('language') ? window.localStorage.getItem('language') : 'zh',
  messages,
})

ElementLocale.i18n((key, value) => i18n.t(key, value));

export default i18n;




















