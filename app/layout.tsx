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
      <head>
        <style>
          {`
          @font-face {
            font-family: 'SangBleuKingdom';
            src: url('/Fonts/SangBlue-Cuts/SangBleuKingdom-Light-WebXL.woff') format('woff'),
                 url('/Fonts/SangBlue-Cuts/SangBleuKingdom-Light-WebS.woff') format('woff');
            font-weight: 300;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'Suisse-Intl-Book';
            src: url('/Fonts/Suisse-Intl-Book/SuisseIntl-Book-WebM.woff') format('woff'),
                 url('/Fonts/Suisse-Intl-Book/SuisseIntl-Book-WebS.woff') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          
          @font-face {
            font-family: 'Suisse-Intl-Light';
            src: url('/Fonts/Suisse-Intl-Light/SuisseIntl-Light-WebM.woff') format('woff'),
                 url('/Fonts/Suisse-Intl-Light/SuisseIntl-Light-WebS.woff') format('woff');
            font-weight: 300;
            font-style: normal;
            font-display: swap;
          }
          
          .title-font {
            font-family: 'SangBleuKingdom', serif;
          }
          
          .header-font {
            font-family: 'Suisse-Intl-Book', sans-serif;
          }
          
          .body-font {
            font-family: 'Suisse-Intl-Light', sans-serif;
          }
          `}
        </style>
      </head>
      <body className="bg-[#FBF8F3] body-font">{children}</body>
    </html>
  )
}
