module.exports = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000',
  },
  async rewrites() {
    return [
      {
        source: '/:file(.+\\.(js|txt|html|css|json|xml|svg))',
        destination: '/api/root-files/:file',
      },
    ];
  },
};
