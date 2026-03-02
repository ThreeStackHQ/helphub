import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@helphub/db', '@helphub/config'],
};

export default nextConfig;
