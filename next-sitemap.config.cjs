/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.coloring-pages.app',
  generateRobotsTxt: false,
  exclude: ['/admin/*', '/api/*', '/auth/*', '/creem-success/*', '/pay-success/*'],
  generateIndexSitemap: false,
} 