import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Optional: allow public GCS-hosted images (e.g. https://storage.googleapis.com/<bucket>/path)
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      // Optional: allow https://<bucket>.storage.googleapis.com/path
      {
        protocol: 'https',
        hostname: '*.storage.googleapis.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
