import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SUAS Digital | Gestão CRAS',
  description: 'Sistema de Gestão e Acompanhamento Familiar do Centro de Referência da Assistência Social.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>{children}</body>
    </html>
  )
}
