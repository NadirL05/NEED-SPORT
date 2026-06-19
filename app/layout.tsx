import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import Toast from '@/components/Toast'
import BottomNav from '@/components/BottomNav'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'NEEDSPORT. — Maillots de foot officiels',
  description: 'Achetez vos maillots de football officiels. Clubs et sélections nationales. Livraison express. Coupe du Monde 2026.',
  keywords: ['maillot foot', 'maillot officiel', 'coupe du monde 2026', 'maillot Real Madrid', 'maillot France', 'NEEDSPORT', 'NEED SPORT'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'NEEDSPORT.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body>
<CustomCursor />
        {children}
        <BottomNav />
        <Toast />
      </body>
    </html>
  )
}
