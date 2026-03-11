import './globals.css'

export const metadata = {
  title: '1Fi Phone Store',
  description: 'Fullstack developer assignment',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}