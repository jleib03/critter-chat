"use client"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

  return (
    <header className="w-full py-5 px-6 flex justify-between items-center relative">
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

        <Link href="/pro/custom-agent" className="text-[#333] hover:text-[#94ABD6] transition-colors text-sm body-font">
          Custom Support Agent
        </Link>
      </div>

      <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
        <Image src="/images/critter-logo.png" alt="Critter" width={120} height={40} className="h-8 w-auto" />
      </Link>

      <Link
        href="https://critter.pet"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#333] hover:text-[#E75837] transition-colors text-sm body-font"
      >
        Learn more
      </Link>
    </header>
  )
}
