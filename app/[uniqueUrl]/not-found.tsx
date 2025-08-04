import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border p-8 space-y-4">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.007-5.691-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 header-font">Page Not Found</h2>
            <p className="text-gray-600 body-font mt-2">
              The booking page you're looking for doesn't exist or isn't available.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-[#E75837] hover:bg-[#d14a2a] text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
