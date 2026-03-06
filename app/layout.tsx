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
      <body style={{ fontFamily: "'Metropolis', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
