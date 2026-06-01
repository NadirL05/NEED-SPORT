import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/CustomCursor'
import Toast from '@/components/Toast'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MAILLO. — Maillots de foot officiels | NEED SPORT',
  description: 'Achetez vos maillots de football officiels. Clubs et sélections nationales. Livraison express. Coupe du Monde 2026.',
  keywords: ['maillot foot', 'maillot officiel', 'coupe du monde 2026', 'maillot Real Madrid', 'maillot France', 'NEED SPORT'],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'MAILLO. — NEED SPORT',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body>
        <CustomCursor />
        {children}
        <Toast />
      </body>
    </html>
  )
}
