/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración simplificada para Railway
  output: 'standalone',
  async rewrites() {
    // En Railway, usamos rutas relativas ya que todo está en el mismo servicio
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // En desarrollo, redirigir al backend local
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig 