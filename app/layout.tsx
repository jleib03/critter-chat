import type React from "react"
import "./globals.css"

export const metadata = {
  title: "Critter Pet Services",
  description: "Book pet care services with Critter",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
          @font-face {
            font-family: 'Sangbleu Kingdom';
            src: url('/fonts/SangBleuKingdom-Regular.woff2') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          .title-font, .header-font {
            font-family: 'Sangbleu Kingdom', serif;
          }
          
          .body-font {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          `}
        </style>
      </head>
      <body className="bg-[#FBF8F3]">{children}</body>
    </html>
  )
}
