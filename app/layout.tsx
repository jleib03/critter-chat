import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Critter - Professional Pet Care Services",
  description:
    "Book trusted pet care professionals for dog walking, pet sitting, and more. Connect with vetted pet care providers in your area through Critter.",
  generator: "v0.dev",

  // Open Graph tags for Facebook, LinkedIn, etc.
  openGraph: {
    title: "Critter - Professional Pet Care Services",
    description:
      "Book trusted pet care professionals for dog walking, pet sitting, and more. Connect with vetted pet care providers in your area through Critter.",
    url: "https://booking.critter.pet",
    siteName: "Critter",
    images: [
      {
        url: "/images/critter-logo.png",
        alt: "Critter - Professional Pet Care Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter Card tags
  twitter: {
    card: "summary",
    title: "Critter - Professional Pet Care Services",
    description:
      "Book trusted pet care professionals for dog walking, pet sitting, and more. Connect with vetted pet care providers in your area through Critter.",
    images: ["/images/critter-logo.png"],
    creator: "@critterpet",
    site: "@critterpet",
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

  // Favicon and app icons
  icons: {
    icon: "/images/critter-favicon.png",
    shortcut: "/images/critter-favicon.png",
    apple: "/images/critter-favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
