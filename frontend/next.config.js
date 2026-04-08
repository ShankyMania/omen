/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server-side env vars are read directly from process.env at runtime.
  // Client-side vars must be prefixed NEXT_PUBLIC_ in your .env file.
  // Do NOT hardcode secrets here.
}

module.exports = nextConfig
