import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  redirects: async () => [
    { source: "/pages/about", destination: "/about", permanent: true },
    { source: "/pages/links", destination: "/links", permanent: true },
    { source: "/rss", destination: "/rss.xml", permanent: true },
    { source: "/sitemap", destination: "/sitemap.xml", permanent: true },
    { source: "/pages/tweets", destination: "/", permanent: true }
  ]
};
export default nextConfig;
