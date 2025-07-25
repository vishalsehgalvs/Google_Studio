import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/market-prices',
        destination: 'http://localhost:5001/api/market-prices',
      },
      {
        source: '/api/market-analysis',
        destination: 'http://localhost:5001/api/market-analysis',
      },
    ];
  },
};

export default nextConfig;
