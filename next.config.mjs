/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
  // We rely on `tsc --noEmit` for correctness; ESLint stylistic
  // rules (e.g. no-empty-object-type) should not block deploys.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
