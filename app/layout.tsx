import type { Metadata } from 'next'
import '@fontsource/metropolis/400.css'
import '@fontsource/metropolis/500.css'
import '@fontsource/metropolis/600.css'
import '@fontsource/metropolis/700.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'anyOS — An operating system for life',
  description: 'An operating system for life, work, teams, and AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Poiret+One&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Metropolis', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
