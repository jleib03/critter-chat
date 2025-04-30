import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Remove the Poppins import
// import { Poppins } from 'next/font/google'

// Remove the poppins configuration
// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   variable: "--font-poppins",
// })

// Update the title in the metadata
export const metadata: Metadata = {
  title: "Critter - Booking & Info Service",
  description: "Book pet services with Critter Pet Services",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
