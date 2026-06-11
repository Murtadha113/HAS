import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import Navbar from '@/components/Navbar'
import './globals.css'

export const metadata: Metadata = {
  title: '7snjami — منصة رقمية متكاملة',
  description: 'منتجات رقمية وباقات إعلانية احترافية',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className="bg-background">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
