"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 header-font">Something went wrong!</h2>
            <p className="text-gray-600 body-font mt-2">We encountered an error while loading this page.</p>
          </div>
          <button
            onClick={reset}
            className="bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
