import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Critter Pet Services",
  description: "Book pet care services with Critter",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#FBF8F3] font-sans">{children}</body>
    </html>
  )
}
