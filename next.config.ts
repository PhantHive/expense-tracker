/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    basePath: process.env.NODE_ENV === 'production' ? '/expense-tracker' : '',
    assetPrefix: process.env.NODE_ENV === 'production' ? '/expense-tracker/' : '',
}

module.exports = nextConfig