import type { Metadata } from 'next'
import { Space_Grotesk, Poppins, Lexend_Exa } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-space-grotesk',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-poppins',
})

const lexendExa = Lexend_Exa({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-lexend-exa',
})

export const metadata: Metadata = {
  title: 'Dan Gunderson | Product Manager & Developer',
  description: 'Portfolio showcasing my work in product management, full-stack development, and AI innovation.',
  keywords: ['Product Manager', 'Full-Stack Developer', 'AI', 'Portfolio', 'Dan Gunderson'],
  authors: [{ name: 'Dan Gunderson', url: 'https://gundy.io' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  openGraph: {
    title: 'Dan Gunderson — Portfolio',
    description: 'Product, design, and engineering work by Dan Gunderson.',
    url: 'https://gundy.io',
    siteName: 'Dan Gunderson Portfolio',
    type: 'website',
    images: [{ url: 'https://gundy.io/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dan Gunderson — Portfolio',
    description: 'Product, design, and engineering work by Dan Gunderson.',
    images: ['https://gundy.io/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${poppins.variable} ${lexendExa.variable} font-body`}>
        {children}
      </body>
    </html>
  )
}
