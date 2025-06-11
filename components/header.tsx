"use client"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on the pro/set-up page
  const isProSetupPage = pathname === "/pro/set-up"

  return (
    <header className="w-full py-5 px-6">
      {/* Mobile Layout - Stacked */}
      <div className="flex flex-col space-y-4 md:hidden">
        {/* Logo at top on mobile */}
        <div className="flex justify-center">
          <Link href="/">
            <Image src="/images/critter-logo.png" alt="Critter" width={120} height={40} className="h-8 w-auto" />
          </Link>
        </div>

        {/* Navigation links below logo on mobile */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex space-x-3">
            <Link
              href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#333] hover:text-[#E75837] transition-colors body-font"
            >
              Download on iOS
            </Link>

            <Link
              href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#333] hover:text-[#E75837] transition-colors body-font"
            >
              Download on Android
            </Link>
          </div>

          <div className="flex space-x-3">
            {isProSetupPage && (
              <Link href="/how-to-use" className="text-[#333] hover:text-[#E75837] transition-colors body-font">
                Learning Hub
              </Link>
            )}
            <Link
              href="https://critter.pet"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#333] hover:text-[#E75837] transition-colors body-font"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original horizontal layout */}
      <div className="hidden md:flex justify-between items-center relative">
        <div className="flex space-x-6">
          <Link
            href="https://apps.apple.com/us/app/critter-pet-owners-pros/id1630023733"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
          >
            Download on iOS
          </Link>

          <Link
            href="https://play.google.com/store/apps/details?id=com.critterclient&pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
          >
            Download on Android
          </Link>
        </div>

        <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
          <Image src="/images/critter-logo.png" alt="Critter" width={120} height={40} className="h-8 w-auto" />
        </Link>

        <div className="flex space-x-6">
          {isProSetupPage && (
            <Link href="/how-to-use" className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font">
              Learning Hub
            </Link>
          )}
          <Link
            href="https://critter.pet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
          >
            Learn more
          </Link>
        </div>
      </div>
    </header>
  )
}
