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
  title: "NEED SPORT — Porte ce qu'ils portent.",
  description: 'Les maillots des plus grands clubs et nations du monde. Coupes authentiques, tissus officiels, livraison sous 48h.',
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
