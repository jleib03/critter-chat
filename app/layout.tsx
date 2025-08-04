import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Critter Pet Services - Online Booking",
  description: "Book pet care services with Critter professionals. Fast, simple, and reliable pet care booking.",
  keywords: "pet care, dog walking, pet grooming, pet boarding, pet sitting, critter",
  authors: [{ name: "Critter" }],
  creator: "Critter",
  publisher: "Critter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || "https://book.critter.app"),
  openGraph: {
    title: "Critter Pet Services - Online Booking",
    description: "Book pet care services with Critter professionals. Fast, simple, and reliable pet care booking.",
    url: process.env.NEXT_PUBLIC_API_URL || "https://book.critter.app",
    siteName: "Critter Pet Services",
    images: [
      {
        url: "/images/critter-logo.png",
        width: 1200,
        height: 630,
        alt: "Critter Pet Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Critter Pet Services - Online Booking",
    description: "Book pet care services with Critter professionals. Fast, simple, and reliable pet care booking.",
    images: ["/images/critter-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
