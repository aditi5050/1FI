import './globals.css'
import { Manrope, Space_Grotesk } from 'next/font/google'

const textFont = Manrope({
  subsets: ['latin'],
  variable: '--font-text',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
})

export const metadata = {
  title: '1Fi Phone Store',
  description: 'Fullstack developer assignment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${textFont.variable} ${displayFont.variable}`}>
      <body className="antialiased bg-slate-950 text-slate-50">{children}</body>
    </html>
  )
}