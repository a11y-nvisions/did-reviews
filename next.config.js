/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output:"standalone",
  i18n:{
    locales:["ko"],
    defaultLocale:"ko",
  }
}

module.exports = nextConfig
