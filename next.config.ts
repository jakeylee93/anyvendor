import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Booked Events used /businesses/ as the "View all businesses" URL.
    return [{ source: "/businesses", destination: "/directory", permanent: false }];
  },
};

export default nextConfig;
