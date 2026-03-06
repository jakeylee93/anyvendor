import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'anyOS — The last time you\'ll ever set up a computer again',
  description: 'An operating system for life, work, teams, and AI. Launch apps, summon agents, and organise your world from one intelligent workspace.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
