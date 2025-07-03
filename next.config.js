/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    // En Railway, el backend estará en un servicio separado
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-63c7.up.railway.app'
      : 'http://localhost:3001';
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
  // Railway optimization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig 