import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    baseURL: '/',
    head: {
      "charset": "utf-8",
      "viewport": "width=device-width, initial-scale=1",
      meta: [
        // <meta name="viewport" content="width=device-width, initial-scale=1">
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      script: [
        // <script src="https://myawesome-lib.js"></script>
        // { src: 'https://awesome-lib.js' }
      ],
      link: [
        // <link rel="stylesheet" href="https://myawesome-lib.css">
        // { rel: 'stylesheet', href: 'https://awesome-lib.css' }
      ],
      // please note that this is an area that is likely to change
      style: [
        // <style type="text/css">:root { color: red }</style>
        // { children: ':root { color: red }', type: 'text/css' }
      ],
      noscript: [
        // <noscript>Javascript is required</noscript>
        { children: 'Javascript is required' }
      ]
    }
  },
  ssr: true,
  srcDir: 'src/core',
  css: [
    '~/assets/sass/base.common.scss',
  ],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "~/assets/sass/var.scss";@import "~/assets/sass/scss.common.scss";',
        }
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBase: '/api'
    }
  },

  alias: {
    // "~~": "/<rootDir>",
    // "@@": "/<rootDir>",
    // "~": "/<rootDir>",
    // "@": "/<rootDir>",
    // "assets": "/<rootDir>/assets",
    // "public": "/<rootDir>/public",
    // '@site': '/<rootDir>/pages/site',
    // '@user': '/<rootDir>/pages/user',

  },

  vue: {

  },
})
