module.exports = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://courteous-motivation-production-b6ad.up.railway.app/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://courteous-motivation-production-b6ad.up.railway.app',
  },
  async rewrites() {
    return [
      { source: '/sw.js', destination: '/api/root-files/sw.js' },
      { source: '/ads.txt', destination: '/api/root-files/ads.txt' },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://oyun-qpkg2j7c0-meos-projects-2ed8ce2c.vercel.app' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};
