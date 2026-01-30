// © 2026 Lagishetti Vignesh. All rights reserved.
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/components/theme-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Inpilot - AI Interview Practice',
  description: 'Practice interviews with AI-powered voice assistance',
  keywords: ['AI interview', 'interview practice', 'voice assistant', 'job interview', 'interview preparation'],
  authors: [{ name: 'Lagishetti Vignesh' }],
  creator: 'Lagishetti Vignesh',
  publisher: 'Lagishetti Vignesh',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://inpilot.vigneshlagishetti.me',
    title: 'Inpilot - AI Interview Practice',
    description: 'Practice interviews with AI-powered voice assistance',
    siteName: 'Inpilot',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inpilot - AI Interview Practice',
    description: 'Practice interviews with AI-powered voice assistance',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
