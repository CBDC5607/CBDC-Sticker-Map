/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allows this app to be embedded in an <iframe> on your Squarespace domain.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://coffinbaydesignco.com.au https://www.coffinbaydesignco.com.au https://*.squarespace.com",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
