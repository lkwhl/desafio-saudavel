import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0d0f12',
}

export const metadata: Metadata = {
  title: 'Desafio Saudável 💪',
  description: 'Desafio de hábitos saudáveis — 01/07 a 16/08',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Desafio',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
