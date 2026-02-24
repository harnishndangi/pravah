import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow standalone output for containerized deployments
  output: 'standalone',
  // Ensure env var is exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  },
};

export default nextConfig;
