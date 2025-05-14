import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "Critter Pet Services",
  description: "Book pet care services with Critter",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/xxxxxxx.css" // Replace with your actual Typekit ID if you have one
        />
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
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
