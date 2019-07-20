const siteInfo = require('./content/setup/info.json')
console.log(siteInfo)
const glob = require('glob')
const path = require('path')

// Enhance Nuxt's generate process by gathering all content files from Netifly CMS
// automatically and match it to the path of your Nuxt routes.
// The Nuxt routes are generate by Nuxt automatically based on the pages folder.
const dynamicRoutes = getDynamicPaths({
  '/blog': 'blog/posts/*.json',
  '/page': 'page/posts/*.json',
  '/category': 'categories/posts/*.json',
  '/tagged': 'tags/posts/*.json',
})

module.exports = {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  pageTransition: { mode: 'in-out' },
  env: {
    API_URL: process.env.API_URL,
  },
  head: {
    title: siteInfo.sitename,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: siteInfo.sitedescription,
      },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Archivo+Black',
      },
    ],
  },
  css: ['@/assets/grid.css', 'bf-solid/dist/solid.latest.css'],
  // icon: {
  //   iconSrc: `${siteInfo.siteicon}`
  //  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: '#3B8070' },
  modules: ['@nuxtjs/markdownit', '@nuxtjs/pwa', '@nuxtjs/axios'],
  markdownit: {
    injected: true,
    preset: 'default',
    breaks: true,
    html: true,
  },
  manifest: {
    name: siteInfo.sitename,
    short_name: siteInfo.sitename,
    description: siteInfo.sitedescription,
    lang: 'en',
  },
  workbox: {
    runtimeCaching: [
      {
        urlPattern: '/images/uploads/.*',
        handler: 'cacheFirst',
        strategyOptions: {
          cacheName: 'image-cache',
          cacheExpiration: {
            maxEntries: 100,
            maxAgeSeconds: 86400,
          },
        },
      },
    ],
  },

  /*
   ** Route config for pre-rendering
   */
  router: {
    scrollBehavior(to, from, savedPosition) {
      return { x: 0, y: 0 }
    },
    middleware: ['title'],
  },
  generate: {
    routes: dynamicRoutes,
  },
  plugins: [
    '~/plugins/vuefuse',
    {
      src: '~/plugins/moment',
      ssr: false,
    },
    {
      src: '~/plugins/lazyload',
      ssr: false,
    },
  ],
  /*
   ** Build configuration
   */
  build: {
    extractCSS: true,
  },
}

/**
 * Create an array of URLs from a list of files
 * @param {*} urlFilepathTable
 */
function getDynamicPaths(urlFilepathTable) {
  return [].concat(
    ...Object.keys(urlFilepathTable).map(url => {
      const filepathGlob = urlFilepathTable[url]
      return glob
        .sync(filepathGlob, { cwd: 'content' })
        .map(filepath => `${url}/${path.basename(filepath, '.json')}`)
    })
  )
}
