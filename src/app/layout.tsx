import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SaaS Gestión de Pedidos',
  description: 'Sistema SaaS multi-tenant para gestión de pedidos desde múltiples locales comerciales',
  keywords: ['saas', 'pedidos', 'restaurantes', 'locales', 'gestión'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 