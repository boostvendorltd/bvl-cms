/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });
        return config;
    },
    // turbopack: {},
};

module.exports = nextConfig;
