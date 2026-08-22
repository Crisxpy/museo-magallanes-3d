/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.surdoc.cl" },
      { protocol: "https", hostname: "www.surdoc.cl" },
      { protocol: "https", hostname: "surdoc.cl" },
      { protocol: "https", hostname: "**.sketchfab.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
