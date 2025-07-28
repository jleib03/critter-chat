"use client"

import { useEffect } from "react"
import { AlertCircle } from "lucide-react"

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
    <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2 header-font">Something went wrong!</h2>
          <p className="text-red-600 mb-4 body-font">
            We couldn't load the professional information. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors body-font"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
