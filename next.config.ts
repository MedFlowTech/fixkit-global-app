import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
reactStrictMode: true,
experimental: {
typedRoutes: true,
optimizePackageImports: ['react', 'react-dom']
}
};
export default nextConfig;