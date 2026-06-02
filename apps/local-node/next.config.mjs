/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export so it can be served from file:// in Electron
  trailingSlash: true,
  reactStrictMode: true,
  experimental: {
    // Allow workspace packages to be bundled
    externalDir: true,
  },
  // When the UI is loaded in Electron via file://, relative API URLs break.
  // We rely on NEXT_PUBLIC_API_URL injected at build time.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
};

export default nextConfig;
