import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Desafio Saudável 💪',
  description: 'Desafio de hábitos saudáveis — 01/07 a 16/08',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
