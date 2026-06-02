import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: not using `output: 'export'` because the roast detail page
  // uses dynamic params that don't work with static export. Instead the
  // Electron wrapper starts the Next.js server (via `next start`) on
  // port 3000 in production, alongside the Fastify API on 4000.
  trailingSlash: true,
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      '@': __dirname,
    };
    return config;
  },
};

export default nextConfig;
