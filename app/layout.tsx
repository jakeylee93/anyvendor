import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AnyVendor — Events Industry, Connected',
  description: 'The events platform that connects suppliers, clients and opportunities.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
