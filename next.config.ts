import type { NextConfig } from 'next';

const config: NextConfig = {
  devIndicators: false,
  experimental: { agentUpgrade: 'security' },
  // Comic line art needs a sharper optimizer setting than the default 75.
  images: { qualities: [75, 80, 82] },
};
export default config;
