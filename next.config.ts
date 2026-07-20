import path from 'node:path'

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Pin the workspace root: a sibling package.json in the parent directory
  // (unrelated personal projects) otherwise gets picked up by Turbopack's
  // root-detection heuristic and breaks module resolution.
  turbopack: {
    root: path.join(__dirname),
  },
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
