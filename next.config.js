/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // En Railway, el backend estará en un servicio separado
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-63c7.up.railway.app'
      : 'http://localhost:8080';
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig 