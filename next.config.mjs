/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed output: "export" to enable API routes for Stripe integration
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Stub optional deps that should not be resolved in web builds
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "pino-pretty": false,
      "react-native": false,
      "@react-native-async-storage/async-storage": false,
    }
    return config
  },
}

export default nextConfig
