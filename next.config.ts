import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
    // WebP over AVIF on purpose: it decodes faster on low-end phones, which keeps scrolling smooth.
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1280],
    imageSizes: [64, 128, 256, 384, 480, 560],
    // Must match IMAGE_QUALITY in src/lib/images.ts.
    qualities: [50, 85, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // YouTube embeds fail with error 153 when no referrer is sent, so keep the origin.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default config;
