import React from 'react';
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { HydrationGuard } from '@/components/hydration-guard'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Calaf.co Hesap Defteri',
  description: 'Modern muhasebe ve CRM sistemi',
  robots: 'noindex, nofollow',
  authors: [{ name: 'Calaf.co' }],
  keywords: ['muhasebe', 'crm', 'hesap defteri', 'finans'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <HydrationGuard>
          {children}
        </HydrationGuard>
      </body>
    </html>
  )
}