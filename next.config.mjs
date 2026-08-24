/** @type {import('next').NextConfig} */
const nextConfig = {
 
  reactStrictMode: false,
  productionBrowserSourceMaps: false,
  transpilePackages: ['jodit-react', 'jodit'],


    images: {
    domains: ["stage.digibima.com", "digibima.com", "cdn.digibima.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "stage.digibima.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        
        source: "/api/:path*",
        destination: "https://stage.digibima.com/api/:path*", // note /api here
      },
    ];
  },
  
};

export default nextConfig;
