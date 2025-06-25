"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-[#E75837] text-white rounded-lg hover:bg-[#d04e30] transition-colors body-font"
      >
        Try again
      </button>
    </div>
  )
}
