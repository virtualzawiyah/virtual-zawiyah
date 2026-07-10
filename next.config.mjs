/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      {
        source: '/admission',
        destination: '/enrollment',
        permanent: true,
      },
      {
        source: '/pricing',
        destination: '/fee',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
// Touch to restart dev server
