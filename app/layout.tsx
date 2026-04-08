import React, { type ReactNode } from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientLayout from './client'

export const metadata: Metadata = {
  metadataBase: new URL('https://samaa.app'),
  title: 'Samaa',
  description: 'Muslim Futurists Marriage',
  keywords: [
    'samaa',
    'muslim dating',
    'muslim love',
    'muslim marriage',
    'islamic matrimony',
    'muslim matchmaking',
  ],
  authors: [{ name: '9bapa' }],
  alternates: {
    canonical: 'https://samaa.app',
  },
  manifest: '/manifest.json',
  icons: {
    icon: ['/icons/icon-32x32.ico', '/icons/icon-16x16.ico'],
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Samaa',
    description: 'Muslim Futurists Marriage',
    url: 'https://samaa.app',
    siteName: 'Samaa',
    type: 'website',
    images: [
      {
        url: '/home.png',
        width: 1200,
        height: 630,
        alt: 'Samaa',
      },
    ],  
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gamerholic',
    description: 'I Win For A Living - blockchain esports',
    images: ['/home.png'],
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
