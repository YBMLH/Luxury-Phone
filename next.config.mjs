/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Images come from Firebase Storage and are lazy-loaded with plain <img>.
    // Disabling Next.js image optimization keeps hosting 100% free.
    unoptimized: true,
  },
};

export default nextConfig;
