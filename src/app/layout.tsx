import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fleet Management System',
  description: 'Professional fleet tracking and management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  )
}
