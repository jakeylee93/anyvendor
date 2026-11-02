import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Booked Events used /businesses/ as the "View all businesses" URL.
    return [
      { source: "/businesses", destination: "/directory", permanent: false },
      { source: "/business/social", destination: "/business/marketing", permanent: false },
    ];
  },
};

export default nextConfig;
