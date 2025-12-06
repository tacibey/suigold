/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Web3 paketlerini derleyiciye tanıtıyoruz
  transpilePackages: ['@suiet/wallet-kit', '@mysten/dapp-kit', '@mysten/sui.js'],
};

export default nextConfig;